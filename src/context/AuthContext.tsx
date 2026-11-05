import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  sendPasswordReset as fbSendPasswordReset,
  signOutUser as fbSignOutUser,
  getUserProfile,
  recordDisclaimerAcceptance,
  exportUserDataDossier,
  deleteUserAccountAndData,
  SynthosUserProfile,
  UserRole
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export interface ClinicianProfile {
  uid?: string;
  name: string;
  credentials: string;
  role: UserRole;
  email?: string;
  institution?: string;
  isGuest: boolean;
  disclaimerAccepted: boolean;
}

export const DEFAULT_GUEST_PROFILE: ClinicianProfile = {
  name: 'Clinician Guest',
  credentials: 'Guest / Evaluator',
  role: 'user',
  email: 'guest@synthos-cds.org',
  institution: 'Demo Sandbox',
  isGuest: true,
  disclaimerAccepted: false
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
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  exportMyData: () => Promise<void>;
  deleteMyAccount: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
  requireAuthForAction: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<SynthosUserProfile | null>(null);
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
        try {
          localStorage.removeItem('synthos_guest_mode');
          const userProf = await getUserProfile(user.uid);
          setProfile(userProf);
          if (userProf?.disclaimerAccepted) {
            setLocalDisclaimerAccepted(true);
            localStorage.setItem('synthos_disclaimer_accepted', 'true');
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
    try {
      localStorage.setItem('synthos_guest_mode', 'true');
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

  const signInEmail = async (email: string, pass: string) => {
    const user = await fbLoginWithEmail(email, pass);
    const userProf = await getUserProfile(user.uid);
    setProfile(userProf);
    setIsAuthModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const signUpEmail = async (email: string, pass: string) => {
    const user = await fbRegisterWithEmail(email, pass);
    const userProf = await getUserProfile(user.uid);
    setProfile(userProf);
    setIsAuthModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const resetPassword = async (email: string) => {
    await fbSendPasswordReset(email);
  };

  const signOut = async () => {
    await fbSignOutUser();
    setCurrentUser(null);
    setProfile(null);
    setIsGuest(false);
    try {
      localStorage.removeItem('synthos_guest_mode');
    } catch {
      // ignore
    }
  };

  const exportMyData = async () => {
    if (!currentUser) return;
    const data = await exportUserDataDossier(currentUser.uid);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `SYNTHOS_Personal_Dossier_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const deleteMyAccount = async () => {
    if (!currentUser) return;
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete your account and all associated cases and audit logs? This action is irreversible.'
    );
    if (!confirmDelete) return;

    await deleteUserAccountAndData(currentUser.uid);
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

  const requireAuthForAction = (action: () => void) => {
    if (currentUser || isGuest) {
      action();
    } else {
      openAuthModal(action);
    }
  };

  const userRole: UserRole = profile?.role || (currentUser?.email === 'sivasyam05@gmail.com' ? 'admin' : 'user');
  const isAuthenticated = !!currentUser;

  const clinician: ClinicianProfile = {
    uid: currentUser?.uid,
    name: profile?.displayName || currentUser?.displayName || (isGuest ? 'Guest Evaluator' : 'Clinician Evaluator'),
    credentials: userRole === 'admin' ? 'Master Administrator' : userRole === 'reviewer' ? 'Clinical Reviewer' : 'PharmD, BCPS',
    role: userRole,
    email: currentUser?.email || (isGuest ? 'guest@synthos-cds.org' : undefined),
    institution: userRole === 'admin' ? 'Department of Clinical Pharmacotherapy' : 'Clinical Practice Group',
    isGuest,
    disclaimerAccepted: profile?.disclaimerAccepted || localDisclaimerAccepted
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
        signInGoogle,
        signInEmail,
        signUpEmail,
        resetPassword,
        signOut,
        exportMyData,
        deleteMyAccount,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        requireAuthForAction
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
