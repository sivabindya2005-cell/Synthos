import React, { useState, useEffect, useCallback } from 'react';
import {
  AnonymizedSimulationRecord,
  AdminTelemetrySummary,
  fetchAdminTelemetryFromServer,
  adminLogin,
  logoutAdmin,
  isUserAdminAuthenticated,
  getAdminEmail,
  getAdminToken,
  resetServerTelemetryDatabase
} from '../../utils/simulationStorage';

interface SimulationVaultViewProps {
  onOpenProvenance?: (id: string) => void;
  onLaunchTwin?: () => void;
  onOpenPersonalizeRegimen?: () => void;
}

export const SimulationVaultView: React.FC<SimulationVaultViewProps> = ({
  onOpenProvenance,
  onLaunchTwin,
  onOpenPersonalizeRegimen
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isUserAdminAuthenticated());
  const [adminEmailInput, setAdminEmailInput] = useState<string>('sivasyam05@gmail.com');
  const [adminKeyInput, setAdminKeyInput] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);

  // Telemetry Database State
  const [records, setRecords] = useState<AnonymizedSimulationRecord[]>([]);
  const [summary, setSummary] = useState<AdminTelemetrySummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Filters & Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedViolationFilter, setSelectedViolationFilter] = useState<'all' | 'violations-only' | 'safe-only'>('all');
  const [selectedRecord, setSelectedRecord] = useState<AnonymizedSimulationRecord | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Fetch telemetry records from server
  const loadServerTelemetry = useCallback(async () => {
    if (!isUserAdminAuthenticated()) return;
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const response = await fetchAdminTelemetryFromServer();
      if (response && response.records) {
        setRecords(response.records);
        setSummary(response.summary);
        if (response.records.length > 0 && !selectedRecord) {
          setSelectedRecord(response.records[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching admin telemetry:', err);
      setFetchError(err.message || 'Unable to retrieve records from server telemetry database.');
      if (err.message && err.message.toLowerCase().includes('re-authenticate')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedRecord]);

  // Initial load when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadServerTelemetry();
    }
  }, [isAuthenticated, loadServerTelemetry]);

  // Auto-refresh interval (15 seconds)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      loadServerTelemetry();
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, loadServerTelemetry]);

  // Handle Admin Login submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!adminEmailInput.trim()) {
      setAuthError('Please enter the administrator email.');
      return;
    }
    if (!adminKeyInput.trim()) {
      setAuthError('Please enter the administrator passkey.');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      const result = await adminLogin(adminEmailInput, adminKeyInput);
      if (result.success) {
        setIsAuthenticated(true);
        setAuthError(null);
        setAdminKeyInput('');
      } else {
        setAuthError(result.error || 'Authentication denied. Access key invalid.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Connection failure to authentication service.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setRecords([]);
    setSummary(null);
    setSelectedRecord(null);
  };

  const handleConfirmClear = async () => {
    setIsResetting(true);
    try {
      await resetServerTelemetryDatabase();
      await loadServerTelemetry();
      setShowResetConfirm(false);
      setCopyNotice('Database reset to baseline benchmark cohort.');
      setTimeout(() => setCopyNotice(null), 3500);
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportDirect = (format: 'json' | 'csv') => {
    const token = getAdminToken();
    if (!token) return;
    const link = document.createElement('a');
    link.href = `/api/admin/export?format=${format}`;
    // Fetch with header to trigger download
    fetch(`/api/admin/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SYNTHOS_Telemetry_DB_${new Date().toISOString().slice(0, 10)}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error('Export download error:', err);
      });
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.simulationParameters.drugGenericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.primaryOrganProfile.egfrStage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.primaryOrganProfile.cypGenotype.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.clientSessionId && r.clientSessionId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesViolation =
      selectedViolationFilter === 'all'
        ? true
        : selectedViolationFilter === 'violations-only'
        ? r.pharmacokineticOutcomes.safetyCeilingExceeded
        : !r.pharmacokineticOutcomes.safetyCeilingExceeded;

    return matchesSearch && matchesViolation;
  });

  const totalSimulations = summary?.totalSimulations ?? records.length;
  const violationCount = summary?.safetyViolations ?? records.filter(r => r.pharmacokineticOutcomes.safetyCeilingExceeded).length;
  const safeCount = summary?.safeTitrations ?? (totalSimulations - violationCount);
  const uniqueSessions = summary?.uniqueSessions ?? new Set(records.map(r => (r as any).clientSessionId || r.id)).size;

  const handleCopyJson = (record: AnonymizedSimulationRecord) => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopyNotice(`De-identified record ${record.id} copied to clipboard!`);
    setTimeout(() => setCopyNotice(null), 3000);
  };

  // ==========================================
  // VIEW 1: ADMIN SECURITY GATE (LOCKED)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="py-6 px-2 sm:px-6 max-w-xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Gate Banner */}
          <div className="bg-[#0b1e28] text-white p-6 border-b border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#E6F4F1]0/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#E6F4F1]0/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <span className="material-symbols-outlined text-[24px]">lock</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-teal-400 uppercase">
                  RESTRICTED ACCESS
                </span>
                <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">
                  Telemetry Database Gate
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              This private tracking database stores live simulation telemetry, drug titration records, and safety ceiling audits. Access is strictly limited to the verified system administrator.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
                <span className="material-symbols-outlined text-[#DC2626] text-[18px] shrink-0 mt-0.5">
                  error
                </span>
                <div>
                  <strong className="font-bold block">Access Denied</strong>
                  <span>{authError}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Authorized Administrator Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  account_circle
                </span>
                <input
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="sivasyam05@gmail.com"
                  className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 focus:bg-slate-50/50 outline-none transition-all"
                  required
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded bg-[#E6F4F1] text-[#0F766E] border border-[#BEE3DB] font-bold">
                  Designated Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Only <strong className="text-slate-700">sivasyam05@gmail.com</strong> possesses cryptographic decryption privileges.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Administrator Passkey
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  vpn_key
                </span>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  placeholder="Enter administrator passkey..."
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 focus:bg-slate-50/50 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title={showKey ? 'Hide passkey' : 'Show passkey'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showKey ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Default project key: <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">synthos-admin-2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#14B8A6] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmittingAuth ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Authenticating Privileges...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Unlock Admin Telemetry Database</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy & Safety Guarantee */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 text-[11px] text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified_user</span>
              <span>Patient Privacy &amp; Data Safety Architecture</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[10.5px]">
              • <strong>Zero PHI:</strong> All data logged conforms to HIPAA Safe Harbor (45 CFR § 164.514). No patient names, MRNs, initials, or addresses are ever captured.
              <br />
              • <strong>Access Isolation:</strong> Public users and clinicians cannot read this telemetry store. Every session generates synthetic tokens (e.g., ANON-SIM-XXXX).
              <br />
              • <strong>Full Ownership:</strong> Only you (sivasyam05@gmail.com) can view live simulations, export audit tables, or reset records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNLOCKED ADMIN TRACKING DASHBOARD
  // ==========================================
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Admin Command Bar */}
      <div className="bg-[#0b1e28] text-white rounded-2xl p-6 shadow-md border border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
              ADMINISTRATOR TELEMETRY DASHBOARD
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-900/90 text-teal-300 border border-teal-500/30 flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[12px]">verified</span>
              {getAdminEmail() || 'sivasyam05@gmail.com'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Live Server Database
            </span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight">
            User Simulation &amp; Titration Tracker
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed">
            Real-time feed of simulations executed by clinicians, researchers, and visitors.
            Track which drugs are being tested, how often safety ceilings are violated, and patient organ clearance states.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              autoRefresh
                ? 'bg-emerald-900/70 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Auto-refresh telemetry every 15 seconds"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{autoRefresh ? 'Live Sync Active' : 'Sync Paused'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={loadServerTelemetry}
            disabled={isLoadingData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer border border-slate-700"
            title="Refresh from server"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoadingData ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          {/* Export JSON */}
          <button
            onClick={() => handleExportDirect('json')}
            className="px-3.5 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#E6F4F1]0 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Download full server JSON database"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export JSON</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => handleExportDirect('csv')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-600 transition-colors cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Download CSV</span>
          </button>

          {/* Admin Lock / Sign Out */}
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Lock Database and sign out"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Lock</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-between">
          <span>{fetchError}</span>
          <button
            onClick={loadServerTelemetry}
            className="text-amber-900 font-bold underline cursor-pointer ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {copyNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
            <span>{copyNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-600 uppercase font-mono">Server Synced</span>
        </div>
      )}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Logged Simulations
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalSimulations}
          </div>
          <span className="text-[11px] text-[#0F766E] font-medium">
            Across {uniqueSessions} unique sessions
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Safety Ceilings Exceeded
          </span>
          <div className="text-2xl font-black text-[#DC2626] font-mono">
            {violationCount}
          </div>
          <span className="text-[11px] text-[#DC2626] font-medium">
            {totalSimulations > 0 ? `${Math.round((violationCount / totalSimulations) * 100)}% of user simulations` : '0%'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Safe Titrations
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {safeCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            Within guideline safe range
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Database Integrity
          </span>
          <div className="text-2xl font-black text-[#0F766E] font-mono flex items-center gap-1">
            <span className="material-symbols-outlined text-[24px] text-[#14B8A6]">shield_lock</span>
            <span>100%</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Zero PHI / De-identified
          </span>
        </div>
      </div>

      {/* Top Tested Drugs Leaderboard */}
      {summary?.topDrugs && summary.topDrugs.length > 0 && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0F766E] text-[18px]">bar_chart</span>
              <span>Most Tested Pharmacological Agents by Users</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Live Aggregation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {summary.topDrugs.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="truncate" title={item.name}>{item.name}</span>
                  <span className="font-mono text-[#0F766E]">{item.count}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#14B8A6] rounded-full"
                    style={{ width: `${Math.min(100, Math.round((item.count / totalSimulations) * 100))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records by Token ID, Drug Name, eGFR stage, Session ID..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-teal-700 focus:bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              onClick={() => setSelectedViolationFilter('all')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs cursor-pointer transition-colors ${
                selectedViolationFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({records.length})
            </button>
            <button
              onClick={() => setSelectedViolationFilter('violations-only')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs cursor-pointer transition-colors ${
                selectedViolationFilter === 'violations-only'
                  ? 'bg-rose-50 text-rose-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Violations Only ({violationCount})
            </button>
            <button
              onClick={() => setSelectedViolationFilter('safe-only')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs cursor-pointer transition-colors ${
                selectedViolationFilter === 'safe-only'
                  ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Safe Titrations ({safeCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Records Table & Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Confidential Record List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0F766E] text-[18px]">folder_open</span>
              <span>Central Telemetry Dossiers ({filteredRecords.length})</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Server-Persisted Database
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No matching simulation records found in database.
              </div>
            ) : (
              filteredRecords.map((r) => {
                const isSelected = selectedRecord?.id === r.id;
                const isViolation = r.pharmacokineticOutcomes.safetyCeilingExceeded;

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className={`p-4 hover:bg-slate-50 transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected ? 'bg-[#E6F4F1]/70 border-l-4 border-l-teal-700' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {r.id}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {r.demographicDecade} • {r.biologicalSex}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isViolation ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] uppercase tracking-wider flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">warning</span>
                            <span>Ceiling Violation</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            <span>Safe</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {r.simulationParameters.drugGenericName}
                      </span>
                      <span className="font-mono text-slate-600">
                        {r.simulationParameters.simulatedDose}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        eGFR {r.primaryOrganProfile.egfr} mL/min ({r.primaryOrganProfile.egfrStage})
                      </span>
                      <span className="font-mono">
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Record Deep Inspection (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          {selectedRecord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#0F766E] uppercase">
                    Record Dossier
                  </span>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900">
                    {selectedRecord.id}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopyJson(selectedRecord)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copy JSON to clipboard"
                >
                  <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  <span>Copy JSON</span>
                </button>
              </div>

              {/* Patient Parameters */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Organ Clearance &amp; Profile
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Age Bracket:</span>{' '}
                    <strong className="text-slate-800 font-mono">{selectedRecord.demographicDecade}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Sex:</span>{' '}
                    <strong className="text-slate-800">{selectedRecord.biologicalSex}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">eGFR:</span>{' '}
                    <strong className="text-slate-800 font-mono">{selectedRecord.primaryOrganProfile.egfr} mL/min</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Serum Cr:</span>{' '}
                    <strong className="text-slate-800 font-mono">{selectedRecord.primaryOrganProfile.scr} mg/dL</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Genotype:</span>{' '}
                    <strong className="text-slate-800 font-mono">{selectedRecord.primaryOrganProfile.cypGenotype}</strong>
                  </div>
                </div>
              </div>

              {/* Simulation Outcomes */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Pharmacokinetic Outcomes
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Simulated t1/2:</span>{' '}
                    <strong className="text-indigo-800 font-mono">{selectedRecord.pharmacokineticOutcomes.simulatedHalfLife}h</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Prolongation:</span>{' '}
                    <strong className="text-indigo-800 font-mono">{selectedRecord.pharmacokineticOutcomes.halfLifeChangeFactor}x</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Peak Css:</span>{' '}
                    <strong className="text-slate-800 font-mono">{selectedRecord.pharmacokineticOutcomes.predictedPeakCss} mcg/mL</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Safety Ceiling:</span>{' '}
                    <strong className="text-slate-800 font-mono">{selectedRecord.pharmacokineticOutcomes.upperSafetyCeiling} mcg/mL</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Guideline Rule Evaluation
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    {selectedRecord.pharmacokineticOutcomes.primarySafetyFinding}
                  </p>
                </div>
              </div>

              {/* Clinician Rationale if provided */}
              {selectedRecord.clinicianRationale && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Recorded Clinician Rationale
                  </span>
                  <p className="text-slate-700 italic text-[11px]">
                    "{selectedRecord.clinicianRationale}"
                  </p>
                </div>
              )}

              {/* Action Buttons for Selected Record */}
              <div className="pt-2 space-y-2">
                {onOpenPersonalizeRegimen && (
                  <button
                    onClick={onOpenPersonalizeRegimen}
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0F766E] hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">tune</span>
                    <span>Personalize Regimen According to Patient Specifics</span>
                  </button>
                )}

                {onLaunchTwin && (
                  <button
                    onClick={onLaunchTwin}
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-300"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0F766E]">arrow_forward</span>
                    <span>Load Case into Digital Twin Simulator</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-slate-300">
                folder_shared
              </span>
              <div>
                <h4 className="font-bold text-slate-700 text-sm">Select an Anonymized Record</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Click on any telemetry entry from the left to inspect full pharmacokinetic curves and guideline evaluations.
                </p>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Server Database · sivasyam05@gmail.com</span>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-slate-400 hover:text-[#DC2626] transition-colors cursor-pointer text-[10px] underline"
            >
              Reset Server DB
            </button>
          </div>
        </div>
      </div>

      {/* In-app Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-[#DC2626]">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reset Telemetry Database?</h3>
                <p className="text-xs text-slate-500">Restore factory benchmark de-identified records</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will reset the central server telemetry database to the default benchmark cohort of anonymized patients and clear accumulated user session traces.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#DC2626] hover:bg-rose-700 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {isResetting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
