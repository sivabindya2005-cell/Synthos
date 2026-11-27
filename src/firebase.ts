import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  increment,
  writeBatch,
  runTransaction,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const localEmulators = import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATORS === 'true';
const appConfig = localEmulators
  ? { ...firebaseConfig, projectId: 'demo-synthos', apiKey: 'demo-api-key', authDomain: 'demo-synthos.firebaseapp.com' }
  : firebaseConfig;
const app = getApps().length === 0 ? initializeApp(appConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
const databaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

if (localEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

// Types
export type UserRole = 'user' | 'reviewer' | 'admin';

export interface SynthosUserProfile {
  uid: string;
  username?: string | null;
  email: string | null;
  displayName: string | null;
  credentials?: string | null;
  institution?: string | null;
  role: UserRole;
  isGuest: boolean;
  disclaimerAccepted: boolean;
  disclaimerAcceptedAt: string | null;
  createdAt: string;
  lastLoginAt: string;
  savedCaseCount?: number;
  preferences?: {
    theme?: 'light' | 'dark';
    doseUnit?: string;
  };
}

export interface AnonymousCaseRecord {
  id?: string;
  caseId?: string;
  anonymousCaseId: string; // e.g. "ANON-PT-4821"
  engineVersion?: string;
  ownerUid: string;
  timestamp: any;
  demographicDecade: string; // "60-69 Y"
  biologicalSex: string;
  inputs: {
    age: number;
    weightKg: number;
    heightCm: number;
    scr: number;
    potassium: number;
    cypGenotype: string;
    selectedDrug: string;
    doseMg: number;
    intervalHours: number;
  };
  outputs: {
    egfr: number;
    crcl: number;
    simulatedHalfLife: number;
    halfLifeChangeFactor: number;
    predictedPeakCss: number;
    upperSafetyCeiling: number;
    safetyCeilingExceeded: boolean;
    primarySafetyFinding: string;
    guidelineViolationCode?: string;
  };
  clinicianNotes?: string;
}

export interface AuditLogEntry {
  id?: string;
  userId: string;
  userEmail?: string | null;
  action: 'SIMULATION_RUN' | 'DOSE_TITRATION' | 'DISCLAIMER_ACCEPTED' | 'AUTH_LOGIN' | 'CASE_DELETED' | 'DATA_EXPORTED';
  details: string;
  anonymousCaseId?: string;
  timestamp: any;
}

export interface ClinicianFeedbackEntry {
  id?: string;
  authorUid: string;
  authorEmail?: string | null;
  category: 'guideline_accuracy' | 'pk_math' | 'drug_coverage' | 'feature_request';
  subject: string;
  message: string;
  drugContext?: string;
  timestamp: any;
}

// ==========================================
// AUTHENTICATION SERVICES
// ==========================================

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(result.user);
  void logAuditEvent(result.user.uid, 'AUTH_LOGIN', 'Signed in via Google OAuth');
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  try {
    await ensureUserProfile(result.user);
  } catch (e) {
    console.warn('ensureUserProfile deferred during email login:', e);
  }
  try {
    await logAuditEvent(result.user.uid, 'AUTH_LOGIN', 'Signed in via Email/Password');
  } catch (e) {
    console.warn('logAuditEvent deferred:', e);
  }
  return result.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  try {
    await ensureUserProfile(result.user);
  } catch (e) {
    console.warn('ensureUserProfile deferred during email registration:', e);
  }
  try {
    await sendEmailVerification(result.user);
  } catch (err) {
    console.warn('Verification email send deferred:', err);
  }
  try {
    await logAuditEvent(result.user.uid, 'AUTH_LOGIN', 'Registered new user account');
  } catch (e) {
    console.warn('logAuditEvent deferred:', e);
  }
  return result.user;
}

/**
 * Register account with Username and Password.
 * Supports optional email, display name, clinical credentials, and institution.
 */
export async function registerWithUsernameAndPassword(
  username: string,
  pass: string,
  options?: { email?: string; displayName?: string; credentials?: string; institution?: string }
): Promise<{ user: FirebaseUser; profile: SynthosUserProfile }> {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  if (cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters (letters, numbers, underscores).');
  }

  // Format email for Firebase Auth provider
  const userEmail = options?.email?.trim() || `${cleanUsername}@synthos.app`;
  const result = await createUserWithEmailAndPassword(auth, userEmail, pass);

  // Store username mapping in localStorage for instant resolution
  try {
    localStorage.setItem(`synthos_user_${cleanUsername}`, userEmail);
    localStorage.setItem(`synthos_last_username`, cleanUsername);
  } catch {
    // non-blocking
  }

  const profile = await ensureUserProfile(result.user, {
    username: cleanUsername,
    displayName: options?.displayName?.trim() || username.trim(),
    credentials: options?.credentials?.trim() || '',
    institution: options?.institution?.trim() || ''
  });

  try {
    await logAuditEvent(result.user.uid, 'AUTH_LOGIN', `Created account with username @${cleanUsername}`);
  } catch (e) {
    console.warn('logAuditEvent deferred:', e);
  }

  return { user: result.user, profile };
}

/**
 * Sign in using Username OR Email + Password
 */
export async function loginWithUsernameOrEmail(
  identifier: string,
  pass: string
): Promise<{ user: FirebaseUser; profile: SynthosUserProfile }> {
  const trimmed = identifier.trim();
  let emailToUse = trimmed;

  if (!trimmed.includes('@')) {
    const cleanUsername = trimmed.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    let mappedEmail: string | null = null;
    try {
      mappedEmail = localStorage.getItem(`synthos_user_${cleanUsername}`);
    } catch {
      // non-blocking
    }
    emailToUse = mappedEmail || `${cleanUsername}@synthos.app`;
  }

  const result = await signInWithEmailAndPassword(auth, emailToUse, pass);

  // If identifier was a pure username, make sure we remember it
  if (!trimmed.includes('@')) {
    try {
      localStorage.setItem(`synthos_last_username`, trimmed);
    } catch {
      // non-blocking
    }
  }

  const profile = await ensureUserProfile(result.user);

  try {
    await logAuditEvent(result.user.uid, 'AUTH_LOGIN', `Signed in as @${profile.username || profile.displayName || 'user'}`);
  } catch (e) {
    console.warn('logAuditEvent deferred:', e);
  }

  return { user: result.user, profile };
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// User Profile & RBAC
export async function ensureUserProfile(
  user: FirebaseUser,
  initialData?: {
    username?: string;
    displayName?: string;
    credentials?: string;
    institution?: string;
  }
): Promise<SynthosUserProfile> {
  // Check if admin by email
  const isAdminEmail = user.emailVerified && user.email?.toLowerCase() === 'sivasyam05@gmail.com';
  const role: UserRole = isAdminEmail ? 'admin' : 'user';

  const inferredUsername =
    initialData?.username ||
    (user.email && user.email.endsWith('@synthos.app')
      ? user.email.replace('@synthos.app', '')
      : user.email?.split('@')[0]) ||
    'clinician';

  const defaultProfile: SynthosUserProfile = {
    uid: user.uid,
    username: inferredUsername,
    email: user.email || `${inferredUsername}@synthos.app`,
    displayName:
      initialData?.displayName ||
      user.displayName ||
      (inferredUsername ? `@${inferredUsername}` : 'Clinician'),
    credentials: initialData?.credentials || '',
    institution: initialData?.institution || '',
    role,
    isGuest: false,
    disclaimerAccepted: false,
    disclaimerAcceptedAt: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    savedCaseCount: 0
  };

  const userRef = doc(db, 'users', user.uid);
  return runTransaction(db, async transaction => {
    const snap = await transaction.get(userRef);
    if ((await transaction.get(doc(db, 'deletionRequests', user.uid))).exists()) {
      return snap.exists() ? snap.data() as SynthosUserProfile : defaultProfile;
    }
    if (!snap.exists()) {
      transaction.set(userRef, defaultProfile);
      return defaultProfile;
    }
    const existing = snap.data() as SynthosUserProfile;
    const changes = {
      lastLoginAt: new Date().toISOString(),
      ...(initialData || {})
    };
    transaction.update(userRef, changes);
    return { ...defaultProfile, ...existing, ...changes };
  });
}
export async function updateUserProfile(
  uid: string,
  updates: Partial<SynthosUserProfile>
): Promise<SynthosUserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, updates, { merge: true });
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as SynthosUserProfile) : null;
  } catch (err) {
    console.error('Error updating user profile:', err);
    return null;
  }
}

export async function getUserProfile(uid: string): Promise<SynthosUserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as SynthosUserProfile;
    }
  } catch (err) {
    console.error('Error getting user profile:', err);
  }
  return null;
}

export async function recordDisclaimerAcceptance(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(
    userRef,
    {
      disclaimerAccepted: true,
      disclaimerAcceptedAt: new Date().toISOString()
    },
    { merge: true }
  );
  await logAuditEvent(uid, 'DISCLAIMER_ACCEPTED', 'Accepted Clinical Decision Support Disclaimer');
}

// ==========================================
// CASE MANAGEMENT (Firestore)
// ==========================================

export async function saveSimulationCase(
  uid: string,
  caseRecord: Omit<AnonymousCaseRecord, 'ownerUid' | 'timestamp'>
): Promise<string> {
  const casesCollection = collection(db, 'cases');
  const payload = {
    ...caseRecord,
    caseId: caseRecord.caseId || caseRecord.anonymousCaseId,
    engineVersion: caseRecord.engineVersion || 'v2.4-pk-engine',
    ownerUid: uid,
    timestamp: serverTimestamp()
  };
  const docRef = doc(casesCollection);
  const batch = writeBatch(db);
  batch.set(docRef, payload);
  batch.update(doc(db, 'users', uid), { savedCaseCount: increment(1) });
  await batch.commit();
  await logAuditEvent(
    uid,
    'SIMULATION_RUN',
    `Executed PK simulation for ${caseRecord.inputs.selectedDrug} (${caseRecord.inputs.doseMg}mg) - ${caseRecord.outputs.safetyCeilingExceeded ? 'CEILING BREACH' : 'SAFE'}`,
    caseRecord.anonymousCaseId
  );

  return docRef.id;
}

export async function getUserSavedCases(uid: string): Promise<AnonymousCaseRecord[]> {
  const casesCollection = collection(db, 'cases');
  const q = query(
    casesCollection,
    where('ownerUid', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id
  })) as AnonymousCaseRecord[];
}

export async function deleteSimulationCase(caseId: string, uid: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'cases', caseId));
  batch.update(doc(db, 'users', uid), { savedCaseCount: increment(-1) });
  await batch.commit();
  await logAuditEvent(uid, 'CASE_DELETED', `Deleted saved simulation case ID: ${caseId}`);
}

// ==========================================
// AUDIT LOGGING
// ==========================================

export async function logAuditEvent(
  userId: string,
  action: AuditLogEntry['action'],
  details: string,
  anonymousCaseId?: string
): Promise<void> {
  try {
    const logsCollection = collection(db, 'auditLogs');
    await addDoc(logsCollection, {
      userId,
      userEmail: auth.currentUser?.email || 'Anonymous',
      action,
      details,
      anonymousCaseId: anonymousCaseId || null,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.warn('Audit log write deferred:', e);
  }
}

export async function getUserAuditLogs(userId: string): Promise<AuditLogEntry[]> {
  try {
    const logsCollection = collection(db, 'auditLogs');
    const q = query(
      logsCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AuditLogEntry[];
  } catch {
    return [];
  }
}

// ==========================================
// CLINICIAN FEEDBACK
// ==========================================

export async function submitFeedback(
  userId: string,
  feedback: Omit<ClinicianFeedbackEntry, 'authorUid' | 'timestamp'>
): Promise<void> {
  const col = collection(db, 'feedback');
  await addDoc(col, {
    ...feedback,
    authorUid: userId,
    authorEmail: auth.currentUser?.email || null,
    timestamp: serverTimestamp()
  });
}

// ==========================================
// GDPR & PRIVACY RIGHTS (Export & Delete Data)
// ==========================================

export async function exportUserDataDossier(userId: string): Promise<any> {
  const profileSnap = await getDoc(doc(db, 'users', userId));
  const profile = profileSnap.exists() ? profileSnap.data() : null;
  const owned = async (name: string, owner: string, op: '==' | 'array-contains' = '==') => {
    const records = await getDocs(query(collection(db, name), where(owner, op, userId)));
    return records.docs.map(record => ({ ...record.data(), id: record.id }));
  };
  const [cases, auditLogs, feedback, handoffs] = await Promise.all([
    owned('cases', 'ownerUid'), owned('auditLogs', 'userId'), owned('feedback', 'authorUid'),
    owned('careHandoffs', 'members', 'array-contains')
  ]);
  const dossier = { platform: 'SYNTHOS', exportGeneratedAt: new Date().toISOString(),
    userProfile: profile, savedCases: cases, auditTrail: auditLogs, feedback, sharedHandoffs: handoffs };

  await logAuditEvent(userId, 'DATA_EXPORTED', 'Exported full personal clinical dossier');
  return dossier;
}

export async function deleteUserAccountAndData(userId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) throw new Error('Sign in to your account before deleting it.');
  const token = await user.getIdTokenResult();
  if (Date.now() - Date.parse(token.authTime) > 3 * 60_000) {
    throw new Error('Sign out and sign in again, then retry account deletion.');
  }
  // A durable marker prevents a second tab from creating new private records during cleanup.
  const marker = doc(db, 'deletionRequests', userId);
  await runTransaction(db, async transaction => {
    if (!(await transaction.get(marker)).exists()) transaction.set(marker, { startedAt: serverTimestamp() });
  });
  for (const [name, owner] of [['cases', 'ownerUid'], ['feedback', 'authorUid']]) {
    const page = query(collection(db, name), where(owner, '==', userId), limit(200));
    while (true) {
      const docs = await getDocs(page);
      if (docs.empty) break;
      const batch = writeBatch(db);
      docs.forEach(record => batch.delete(record.ref));
      await batch.commit();
    }
  }
  await deleteDoc(doc(db, 'users', userId));
  await user.delete();
}