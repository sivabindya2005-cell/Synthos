import { initializeApp, getApps, getApp } from 'firebase/app';
import {
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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
const databaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Types
export type UserRole = 'user' | 'reviewer' | 'admin';

export interface SynthosUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  isGuest: boolean;
  disclaimerAccepted: boolean;
  disclaimerAcceptedAt: string | null;
  createdAt: string;
  lastLoginAt: string;
}

export interface AnonymousCaseRecord {
  id?: string;
  anonymousCaseId: string; // e.g. "ANON-PT-4821"
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
  await logAuditEvent(result.user.uid, 'AUTH_LOGIN', 'Signed in via Google OAuth');
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  await ensureUserProfile(result.user);
  await logAuditEvent(result.user.uid, 'AUTH_LOGIN', 'Signed in via Email/Password');
  return result.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  await ensureUserProfile(result.user);
  try {
    await sendEmailVerification(result.user);
  } catch (err) {
    console.warn('Verification email send deferred:', err);
  }
  await logAuditEvent(result.user.uid, 'AUTH_LOGIN', 'Registered new user account');
  return result.user;
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser(): Promise<void> {
  if (auth.currentUser) {
    try {
      await logAuditEvent(auth.currentUser.uid, 'AUTH_LOGIN', 'User signed out');
    } catch {
      // non-blocking
    }
  }
  await firebaseSignOut(auth);
}

// User Profile & RBAC
export async function ensureUserProfile(user: FirebaseUser): Promise<SynthosUserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  // Check if admin by email
  const isAdminEmail = user.email?.toLowerCase() === 'sivasyam05@gmail.com';
  const role: UserRole = isAdminEmail ? 'admin' : 'user';

  if (!snap.exists()) {
    const newProfile: SynthosUserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Clinician',
      role,
      isGuest: false,
      disclaimerAccepted: false,
      disclaimerAcceptedAt: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    const existing = snap.data() as SynthosUserProfile;
    const updated = {
      ...existing,
      email: user.email,
      role: isAdminEmail ? 'admin' : existing.role || 'user',
      lastLoginAt: new Date().toISOString()
    };
    await setDoc(userRef, updated, { merge: true });
    return updated;
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
    ownerUid: uid,
    timestamp: serverTimestamp()
  };
  const docRef = await addDoc(casesCollection, payload);

  await logAuditEvent(
    uid,
    'SIMULATION_RUN',
    `Executed PK simulation for ${caseRecord.inputs.selectedDrug} (${caseRecord.inputs.doseMg}mg) - ${caseRecord.outputs.safetyCeilingExceeded ? 'CEILING BREACH' : 'SAFE'}`,
    caseRecord.anonymousCaseId
  );

  return docRef.id;
}

export async function getUserSavedCases(uid: string): Promise<AnonymousCaseRecord[]> {
  try {
    const casesCollection = collection(db, 'cases');
    const q = query(
      casesCollection,
      where('ownerUid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as AnonymousCaseRecord[];
  } catch (err) {
    console.error('Error loading saved cases:', err);
    return [];
  }
}

export async function deleteSimulationCase(caseId: string, uid: string): Promise<void> {
  await deleteDoc(doc(db, 'cases', caseId));
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
  const cases = await getUserSavedCases(userId);
  const auditLogs = await getUserAuditLogs(userId);

  const dossier = {
    platform: 'SYNTHOS Clinical Precision Engine',
    exportGeneratedAt: new Date().toISOString(),
    privacyNotice: 'HIPAA Safe Harbor De-Identified Research Store',
    userProfile: profile,
    savedCases: cases,
    auditTrail: auditLogs
  };

  await logAuditEvent(userId, 'DATA_EXPORTED', 'Exported full personal clinical dossier');
  return dossier;
}

export async function deleteUserAccountAndData(userId: string): Promise<void> {
  // 1. Delete all user's cases
  const casesQuery = query(collection(db, 'cases'), where('ownerUid', '==', userId));
  const casesSnap = await getDocs(casesQuery);
  const deleteCasePromises = casesSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deleteCasePromises);

  // 2. Delete all user's audit logs
  const logsQuery = query(collection(db, 'auditLogs'), where('userId', '==', userId));
  const logsSnap = await getDocs(logsQuery);
  const deleteLogPromises = logsSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deleteLogPromises);

  // 3. Delete user profile doc
  await deleteDoc(doc(db, 'users', userId));

  // 4. Delete auth account
  if (auth.currentUser && auth.currentUser.uid === userId) {
    await auth.currentUser.delete();
  }
}
