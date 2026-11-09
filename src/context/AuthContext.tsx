import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  loginWithUsernameOrEmail as fbLoginWithUsernameOrEmail,
  registerWithUsernameAndPassword as fbRegisterWithUsernameAndPassword,
  updateUserProfile as fbUpdateUserProfile,
  saveSimulationCase as fbSaveSimulationCase,
  getUserSavedCases as fbGetUserSavedCases,
  deleteSimulationCase as fbDeleteSimulationCase,
  sendPasswordReset as fbSendPasswordReset,
  signOutUser as fbSignOutUser,
  getUserProfile,
  ensureUserProfile,
  recordDisclaimerAcceptance,
  exportUserDataDossier,
  deleteUserAccountAndData,
  SynthosUserProfile,
  AnonymousCaseRecord,
  UserRole
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { setAdminSessionToken, logoutAdmin } from '../utils/simulationStorage';

export interface ClinicianProfile {
  uid?: string;
  username?: string;
  name: string;
  credentials: string;
  role: UserRole;
  email?: string;
  institution?: string;
  isGuest: boolean;
  disclaimerAccepted: boolean;
  savedCaseCount?: number;
}

export const DEFAULT_GUEST_PROFILE: ClinicianProfile = {
  name: 'Clinician Guest',
  username: 'guest',
  credentials: 'Guest / Evaluator',
  role: 'user',
  email: 'guest@synthos-cds.org',
  institution: 'Demo Sandbox',
  isGuest: true,
  disclaimerAccepted: false,
  savedCaseCount: 0
};

interface AuthContextType {
  isAuthenticated: boolean;
  isGuest: boolean;
  currentUser: FirebaseUser | null;
  profile: SynthosUserProfile | null;
  clinician: ClinicianProfile;
  role: UserRole;
  disclaimerAccepted: boolean;
  acceptDisclaimer: () => Promise<void>;
  enableGuestMode: () => void;
  enableDemoAuth: (role?: 'admin' | 'user') => void;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string) => Promise<void>;
  signInUsername: (identifier: string, pass: string) => Promise<void>;
  signUpUsername: (
    username: string,
    pass: string,
    options?: { email?: string; displayName?: string; credentials?: string; institution?: string }
  ) => Promise<void>;
  updateProfileData: (updates: Partial<SynthosUserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  exportMyData: () => Promise<void>;
  deleteMyAccount: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
  requireAuthForAction: (action: () => void) => void;
  // Personalized Features Management
  savedCases: AnonymousCaseRecord[];
  isLoadingSavedCases: boolean;
  refreshSavedCases: () => Promise<void>;
  saveCaseRecord: (caseRecord: Omit<AnonymousCaseRecord, 'ownerUid' | 'timestamp'>) => Promise<string>;
  deleteSavedCase: (caseId: string) => Promise<void>;
  isPersonalizedModalOpen: boolean;
  openPersonalizedModal: () => void;
  closePersonalizedModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<SynthosUserProfile | null>(null);
  const [demoAuth, setDemoAuth] = useState<{
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('synthos_demo_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem('synthos_guest_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [localDisclaimerAccepted, setLocalDisclaimerAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('synthos_disclaimer_accepted') === 'true';
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Synchronize Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsGuest(false);
        setDemoAuth(null);
        try {
          localStorage.removeItem('synthos_guest_mode');
          localStorage.removeItem('synthos_demo_session');
          let userProf = await getUserProfile(user.uid);
          if (!userProf) {
            userProf = await ensureUserProfile(user);
          }
          setProfile(userProf);
          if (userProf?.disclaimerAccepted) {
            setLocalDisclaimerAccepted(true);
            localStorage.setItem('synthos_disclaimer_accepted', 'true');
          }
          if (user.email?.toLowerCase() === 'sivasyam05@gmail.com' || userProf?.role === 'admin') {
            setAdminSessionToken('sivasyam05@gmail.com');
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const enableGuestMode = () => {
    setIsGuest(true);
    setDemoAuth(null);
    try {
      localStorage.setItem('synthos_guest_mode', 'true');
      localStorage.removeItem('synthos_demo_session');
    } catch {
      // ignore
    }
    setIsAuthModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const enableDemoAuth = (targetRole: 'admin' | 'user' = 'admin') => {
    const isTargetAdmin = targetRole === 'admin';
    const demo = {
      uid: isTargetAdmin ? 'admin-siva-master' : 'clinician-elena-pharmd',
      email: isTargetAdmin ? 'sivasyam05@gmail.com' : 'elena.ramos@synthos-cds.org',
      displayName: isTargetAdmin ? 'Dr. Siva Syam' : 'Dr. Elena Ramos, PharmD',
      role: isTargetAdmin ? ('admin' as UserRole) : ('user' as UserRole)
    };
    setDemoAuth(demo);
    setIsGuest(false);
    setLocalDisclaimerAccepted(true);
    try {
      localStorage.setItem('synthos_demo_session', JSON.stringify(demo));
      localStorage.removeItem('synthos_guest_mode');
      localStorage.setItem('synthos_disclaimer_accepted', 'true');
      if (isTargetAdmin) {
        setAdminSessionToken('sivasyam05@gmail.com');
      }
    } catch {
      // ignore
    }
    setIsAuthModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const acceptDisclaimer = async () => {
    setLocalDisclaimerAccepted(true);
    try {
      localStorage.setItem('synthos_disclaimer_accepted', 'true');
    } catch {
      // ignore
    }

    if (currentUser) {
      await recordDisclaimerAcceptance(currentUser.uid);
      setProfile((prev) => (prev ? { ...prev, disclaimerAccepted: true } : null));
    }
  };

  const signInGoogle = async () => {
    const user = await fbSignInWithGoogle();
    const userProf = await getUserProfile(user.uid);
    setProfile(userProf);
    setIsAuthModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Saved Cases & Personalized State
  const [savedCases, setSavedCases] = useState<AnonymousCaseRecord[]>([]);
  const [isLoadingSavedCases, setIsLoadingSavedCases] = useState<boolean>(false);
  const [isPersonalizedModalOpen, setIsPersonalizedModalOpen] = useState<boolean>(false);

  // Fetch saved cases for current user
  const refreshSavedCases = useCallback(async () => {
    const targetUid = currentUser?.uid || demoAuth?.uid;
    if (!targetUid || isGuest) {
      setSavedCases([]);
      return;
    }
    setIsLoadingSavedCases(true);
    try {
      const cases = await fbGetUserSavedCases(targetUid);
      setSavedCases(cases);
    } catch (err) {
      console.warn('Deferred loading saved cases:', err);
    } finally {
      setIsLoadingSavedCases(false);
    }
  }, [currentUser?.uid, demoAuth?.uid, isGuest]);

  useEffect(() => {
    if (currentUser || demoAuth) {
      refreshSavedCases();
    } else {
      setSavedCases([]);
    }
  }, [currentUser, demoAuth, refreshSavedCases]);

  const signInUsername = async (identifier: string, pass: string) => {
    const { profile: userProf } = await fbLoginWithUsernameOrEmail(identifier, pass);
    setProfile(userProf);
    setIsAuthModalOpen(false);
    await refreshSavedCases();
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const signUpUsername = async (
    username: string,
    pass: string,
    options?: { email?: string; displayName?: string; credentials?: string; institution?: string }
  ) => {
    const { profile: userProf } = await fbRegisterWithUsernameAndPassword(username, pass, options);
    setProfile(userProf);
    setIsAuthModalOpen(false);
    await refreshSavedCases();
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const updateProfileData = async (updates: Partial<SynthosUserProfile>) => {
    const uid = currentUser?.uid;
    if (!uid) return;
    const updated = await fbUpdateUserProfile(uid, updates);
    if (updated) {
      setProfile(updated);
    }
  };

  const saveCaseRecord = async (
    caseRecord: Omit<AnonymousCaseRecord, 'ownerUid' | 'timestamp'>
  ): Promise<string> => {
    const targetUid = currentUser?.uid || demoAuth?.uid;
    if (!targetUid) {
      throw new Error('Please sign in or create an account to save personalized cases.');
    }
    const docId = await fbSaveSimulationCase(targetUid, caseRecord);
    await refreshSavedCases();
    return docId;
  };

  const deleteSavedCase = async (caseId: string) => {
    const targetUid = currentUser?.uid || demoAuth?.uid;
    if (!targetUid) return;
    await fbDeleteSimulationCase(caseId, targetUid);
    await refreshSavedCases();
  };

  const signInEmail = async (email: string, pass: string) => {
    return signInUsername(email, pass);
  };

  const signUpEmail = async (email: string, pass: string) => {
    return signUpUsername(email.split('@')[0], pass, { email });
  };

  const resetPassword = async (email: string) => {
    await fbSendPasswordReset(email);
  };

  const signOut = async () => {
    try {
      await fbSignOutUser();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setProfile(null);
    setDemoAuth(null);
    setSavedCases([]);
    setIsGuest(false);
    logoutAdmin();
    try {
      localStorage.removeItem('synthos_guest_mode');
      localStorage.removeItem('synthos_demo_session');
    } catch {
      // ignore
    }
  };

  const exportMyData = async () => {
    const uid = currentUser?.uid || demoAuth?.uid;
    if (!uid) return;
    const data = await exportUserDataDossier(uid);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `SYNTHOS_Personal_Dossier_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const deleteMyAccount = async () => {
    const uid = currentUser?.uid || demoAuth?.uid;
    if (!uid) return;
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete your account and all associated cases and audit logs? This action is irreversible.'
    );
    if (!confirmDelete) return;

    if (currentUser) {
      await deleteUserAccountAndData(currentUser.uid);
    }
    await signOut();
    alert('Your account and all associated data have been permanently deleted.');
  };

  const openAuthModal = (onSuccessCallback?: () => void) => {
    if (onSuccessCallback) {
      setPendingAction(() => onSuccessCallback);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  const openPersonalizedModal = () => {
    setIsPersonalizedModalOpen(true);
  };

  const closePersonalizedModal = () => {
    setIsPersonalizedModalOpen(false);
  };

  const requireAuthForAction = (action: () => void) => {
    if (currentUser || demoAuth || isGuest) {
      action();
    } else {
      openAuthModal(action);
    }
  };

  const userRole: UserRole =
    profile?.role ||
    demoAuth?.role ||
    (currentUser?.email?.toLowerCase() === 'sivasyam05@gmail.com' ? 'admin' : 'user');

  const isAuthenticated = !!currentUser || !!demoAuth;

  const clinician: ClinicianProfile = {
    uid: currentUser?.uid || demoAuth?.uid,
    username: profile?.username || (currentUser?.email?.split('@')[0]) || demoAuth?.displayName?.toLowerCase().replace(/\s+/g, '_'),
    name:
      profile?.displayName ||
      currentUser?.displayName ||
      demoAuth?.displayName ||
      (isGuest ? 'Guest Evaluator' : 'Clinician Evaluator'),
    credentials:
      profile?.credentials ||
      (userRole === 'admin'
        ? 'Master Administrator'
        : userRole === 'reviewer'
        ? 'Clinical Reviewer'
        : 'PharmD, BCPS'),
    role: userRole,
    email:
      currentUser?.email ||
      demoAuth?.email ||
      (isGuest ? 'guest@synthos-cds.org' : undefined),
    institution:
      profile?.institution ||
      (userRole === 'admin'
        ? 'Department of Clinical Pharmacotherapy'
        : 'Clinical Practice Group'),
    isGuest,
    disclaimerAccepted:
      profile?.disclaimerAccepted ||
      !!demoAuth ||
      localDisclaimerAccepted,
    savedCaseCount: savedCases.length || profile?.savedCaseCount || 0
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuest,
        currentUser,
        profile,
        clinician,
        role: userRole,
        disclaimerAccepted: clinician.disclaimerAccepted,
        acceptDisclaimer,
        enableGuestMode,
        enableDemoAuth,
        signInGoogle,
        signInEmail,
        signUpEmail,
        signInUsername,
        signUpUsername,
        updateProfileData,
        resetPassword,
        signOut,
        exportMyData,
        deleteMyAccount,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        requireAuthForAction,
        savedCases,
        isLoadingSavedCases,
        refreshSavedCases,
        saveCaseRecord,
        deleteSavedCase,
        isPersonalizedModalOpen,
        openPersonalizedModal,
        closePersonalizedModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useClinicianAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useClinicianAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuth = useClinicianAuth;
