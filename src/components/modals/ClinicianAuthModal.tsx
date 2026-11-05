import React, { useState } from 'react';
import { useClinicianAuth } from '../../context/AuthContext';

export const ClinicianAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInGoogle,
    signInEmail,
    signUpEmail,
    resetPassword,
    enableGuestMode,
    isAuthenticated,
    isGuest,
    clinician,
    signOut,
    exportMyData,
    deleteMyAccount
  } = useClinicianAuth();

  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInGoogle();
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (!password.trim() && authTab !== 'forgot')) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (authTab === 'signin') {
        await signInEmail(email, password);
        closeAuthModal();
      } else if (authTab === 'signup') {
        await signUpEmail(email, password);
        setSuccessMessage('Account created successfully! Verification email has been sent.');
        closeAuthModal();
      } else if (authTab === 'forgot') {
        await resetPassword(email);
        setSuccessMessage('Password reset link sent to your email address.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please verify credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Clinician Authentication & Account Settings"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-scale-in">
        {/* Modal Top Banner */}
        <div className="p-6 bg-[#0f2b38] dark:bg-[#07131a] text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-[11px] font-mono tracking-wider uppercase text-teal-300 font-bold">
              FIREBASE AUTH &amp; ACCESS CONTROL
            </span>
          </div>

          <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">
            {isAuthenticated ? 'Clinician Account & Privacy' : 'Clinician Sign-In'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {isAuthenticated
              ? `Signed in as ${clinician.name} (${clinician.role.toUpperCase()})`
              : 'Sign in to persist patient simulations, store customized drug regimens, and maintain clinical audit trails.'}
          </p>
        </div>

        {/* ALREADY AUTHENTICATED VIEW */}
        {isAuthenticated ? (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Account:</span>
                <span className="font-bold text-slate-900 dark:text-white">{clinician.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">System Role:</span>
                <span className="font-mono font-bold text-[#0F766E] dark:text-teal-400 uppercase">
                  {clinician.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Disclaimer Accepted:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {clinician.disclaimerAccepted ? 'Yes (Verified)' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Privacy & GDPR Rights */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Privacy &amp; Data Rights
              </span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={exportMyData}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#0F766E] dark:text-teal-400">download</span>
                  <span>Export My Data Dossier (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={deleteMyAccount}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-[#DC2626] dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">delete_forever</span>
                  <span>Delete My Account &amp; Stored Cases</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                closeAuthModal();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* NOT AUTHENTICATED: SIGN IN / SIGN UP FORM */
          <div className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-[#DC2626] dark:text-rose-400 text-[18px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google One-Click Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              <span className="text-[11px] font-mono text-slate-400 uppercase">Or Email</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
            </div>

            {/* Email Tabs */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                  authTab === 'signin'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                  authTab === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('forgot');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                  authTab === 'forgot'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Reset
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="clinician@hospital.org"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-700"
                  required
                />
              </div>

              {authTab !== 'forgot' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-700"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0F766E] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-60"
              >
                {isLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                <span>
                  {authTab === 'signin' ? 'Sign In to SYNTHOS' : authTab === 'signup' ? 'Create Clinician Account' : 'Send Password Reset Link'}
                </span>
              </button>
            </form>

            {/* Optional Guest Mode (saves nothing) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={enableGuestMode}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium underline cursor-pointer"
              >
                Continue in Guest Mode (Simulate without saving data)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
