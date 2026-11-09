import React, { useState } from 'react';
import { useClinicianAuth } from '../../context/AuthContext';

export const ClinicianAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInGoogle,
    signInUsername,
    signUpUsername,
    resetPassword,
    enableGuestMode,
    enableDemoAuth,
    isAuthenticated,
    clinician,
    profile,
    signOut,
    exportMyData,
    deleteMyAccount,
    openPersonalizedModal
  } = useClinicianAuth();

  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  // Sign In fields
  const [identifier, setIdentifier] = useState(
    () => localStorage.getItem('synthos_last_username') || ''
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up fields
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCredentials, setNewCredentials] = useState('Clinical Pharmacist');
  const [newInstitution, setNewInstitution] = useState('');

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
      console.error('Google Sign-In Error:', err);
      let msg = err.message || 'Google sign-in could not be completed.';
      if (err.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by your browser. Please allow popups or sign in with your Username below.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in window was closed before completion. Please try again or use Username sign-in.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        msg = 'Sign-in was cancelled. Please try again.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Google provider is not configured. Please use Username & Password.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authTab === 'signin') {
      if (!identifier.trim()) {
        setErrorMessage('Please enter your username or email address.');
        return;
      }
      if (!password.trim()) {
        setErrorMessage('Please enter your password.');
        return;
      }

      setIsLoading(true);
      try {
        await signInUsername(identifier.trim(), password);
        closeAuthModal();
      } catch (err: any) {
        console.error('Sign-in error:', err);
        let msg = err.message || 'Authentication failed. Please verify credentials.';
        if (
          err.code === 'auth/invalid-credential' ||
          err.code === 'auth/user-not-found' ||
          err.code === 'auth/wrong-password'
        ) {
          msg = 'Invalid username/email or password. If you do not have an account, click "Create Account".';
        }
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    } else if (authTab === 'signup') {
      const cleanUser = newUsername.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      if (cleanUser.length < 3) {
        setErrorMessage('Username must be at least 3 characters (letters, numbers, or underscores).');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }

      setIsLoading(true);
      try {
        await signUpUsername(cleanUser, newPassword, {
          email: newEmail.trim() || undefined,
          displayName: newDisplayName.trim() || `@${cleanUser}`,
          credentials: newCredentials.trim() || 'Clinical Pharmacist',
          institution: newInstitution.trim() || 'Clinical Practice Group'
        });
        setSuccessMessage(`Account created successfully for @${cleanUser}! Personalized features unlocked.`);
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
      } catch (err: any) {
        console.error('Registration error:', err);
        let msg = err.message || 'Registration failed.';
        if (err.code === 'auth/email-already-in-use') {
          msg = `Username or email is already registered. Please sign in or choose another username.`;
        }
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    } else if (authTab === 'forgot') {
      if (!identifier.trim()) {
        setErrorMessage('Please enter your email or registered username.');
        return;
      }
      setIsLoading(true);
      try {
        const targetEmail = identifier.includes('@')
          ? identifier.trim()
          : `${identifier.trim().toLowerCase()}@synthos.app`;
        await resetPassword(targetEmail);
        setSuccessMessage(`Password reset link sent to ${targetEmail}.`);
      } catch (err: any) {
        setErrorMessage(err.message || 'Unable to send password reset link.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Clinician Authentication & Account Settings"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-scale-in max-h-[92vh]">
        {/* Modal Top Banner */}
        <div className="p-5 sm:p-6 bg-[#0B1528] text-white relative border-b border-cyan-500/20">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-300 font-bold">
              SYNTHOS USER AUTHENTICATION
            </span>
          </div>

          <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">
            {isAuthenticated ? 'Clinician Profile & Personalized Features' : 'Sign In or Create Account'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {isAuthenticated
              ? `Signed in as @${clinician.username || 'clinician'} · ${clinician.name}`
              : 'Create an account with your username and password to access personalized patient twins, custom titration rules, and cloud dossiers.'}
          </p>
        </div>

        {/* ALREADY AUTHENTICATED VIEW */}
        {isAuthenticated ? (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* User Identity Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {clinician.name ? clinician.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <span>{clinician.name}</span>
                      <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400">
                        @{clinician.username}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {clinician.credentials} · {clinician.institution}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {clinician.role}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Saved Cases</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                    {clinician.savedCaseCount ?? profile?.savedCaseCount ?? 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Status</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                    Active &amp; Synced
                  </span>
                </div>
              </div>
            </div>

            {/* Personalized Features Direct Access */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Personalized Features
              </span>
              <button
                type="button"
                onClick={() => {
                  closeAuthModal();
                  openPersonalizedModal();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#15803D] to-[#0D9488] hover:from-[#166534] hover:to-[#0F766E] text-white text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-teal-200">folder_special</span>
                  <div className="text-left">
                    <div>Open My Saved Cases &amp; Personalized Workspace</div>
                    <div className="text-[10px] text-teal-100 font-normal">
                      Load custom twins, review personalized regimens &amp; titration curves
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Privacy & GDPR Rights */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Data Management &amp; Privacy
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={exportMyData}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-teal-400">download</span>
                  <span>Export Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={deleteMyAccount}
                  className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-[#DC2626] dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Delete Account</span>
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
          /* NOT AUTHENTICATED: SIGN IN / SIGN UP TABS */
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
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

            {/* Nav Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === 'signin'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Create Account</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('forgot');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  authTab === 'forgot'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Reset Password"
              >
                <span>Reset</span>
              </button>
            </div>

            {/* SIGN IN FORM */}
            {authTab === 'signin' && (
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Username or Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      account_circle
                    </span>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. dr_alex or alex@hospital.org"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D]"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthTab('forgot')}
                      className="text-[11px] text-[#15803D] dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D]"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">lock_open</span>
                  )}
                  <span>Sign In &amp; Access Personalized Features</span>
                </button>
              </form>
            )}

            {/* CREATE ACCOUNT (SIGN UP) FORM */}
            {authTab === 'signup' && (
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                        @
                      </span>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                        placeholder="dr_sarah"
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#15803D]"
                        required
                        minLength={3}
                        autoComplete="username"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">Min 3 characters (letters, numbers)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Full Name / Title
                    </label>
                    <input
                      type="text"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="Dr. Sarah Chen, PharmD"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#15803D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Clinical Specialty
                    </label>
                    <select
                      value={newCredentials}
                      onChange={(e) => setNewCredentials(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#15803D]"
                    >
                      <option value="Clinical Pharmacist">Clinical Pharmacist (PharmD)</option>
                      <option value="Nephrologist">Nephrologist (MD/DO)</option>
                      <option value="Critical Care Specialist">Critical Care / ICU</option>
                      <option value="Internal Medicine Physician">Internal Medicine</option>
                      <option value="Pharmacology Researcher">Pharmacology Researcher</option>
                      <option value="Clinical Resident">Resident / Fellow</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Institution / Hospital
                    </label>
                    <input
                      type="text"
                      value={newInstitution}
                      onChange={(e) => setNewInstitution(e.target.value)}
                      placeholder="Memorial Hospital"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#15803D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#15803D]"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#15803D]"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-slate-400 font-normal">(Optional, for recovery)</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="sarah.chen@hospital.org"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#15803D]"
                  />
                </div>

                {/* Personalized Features Highlight Banner */}
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
                    <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                    <span>Personalized Features Unlocked Upon Creation:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-teal-700 dark:text-teal-300/90 text-[10px]">
                    <li>Save, reload, and compare custom patient digital twin models</li>
                    <li>Store individualized organ clearance and titration trajectories</li>
                    <li>Persistent HIPAA-safe de-identified clinical simulation dossiers</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  <span>Create Account &amp; Unlock Personalized Features</span>
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authTab === 'forgot' && (
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your registered username or email"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-[#15803D]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {isLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  <span>Send Password Reset Link</span>
                </button>
              </form>
            )}

            {/* Google Alternative & Instant Access */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Or Continue With</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-60"
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

              {/* 1-Click Verified Role Access */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono text-center">
                  Instant Verified Clinical Demo Access
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => enableDemoAuth('user')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-left transition-all hover:scale-[1.01] cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <span className="material-symbols-outlined text-[15px]">medical_services</span>
                      <span>@elena_pharmd</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Dr. Elena Ramos</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => enableDemoAuth('admin')}
                    className="p-2 rounded-xl bg-[#0B1528] hover:bg-[#07111E] text-white border border-cyan-500/40 text-left transition-all hover:scale-[1.01] cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                      <span className="material-symbols-outlined text-[15px]">verified_user</span>
                      <span>@sivasyam</span>
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">Master Administrator</div>
                  </button>
                </div>
              </div>

              {/* Guest Sandbox mode */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={enableGuestMode}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium underline cursor-pointer"
                >
                  Continue as Guest (Evaluation sandbox without cloud saving)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
