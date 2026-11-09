/**
 * Confidential Simulation Vault & Anonymized Research Storage
 * Compliant with HIPAA Safe Harbor de-identification principles:
 * - No patient names, initials, addresses, or MRNs
 * - De-identified synthetic identifiers (e.g. ANON-SIM-9402)
 * - Demographic age decades (e.g. "60-69 Y")
 * - Stores pharmacokinetic simulation outcomes, dosages, clearance metrics, and timestamps
 */

export interface AnonymizedSimulationRecord {
  id: string; // e.g. ANON-SIM-7821
  timestamp: string; // ISO string
  demographicDecade: string; // e.g. "60-69 Y"
  biologicalSex: 'Male' | 'Female' | 'De-identified';
  primaryOrganProfile: {
    egfr: number; // mL/min/1.73m2
    egfrStage: string; // e.g. "CKD Stage 3b"
    scr: number; // mg/dL
    crcl: number; // mL/min
    potassium: number; // mEq/L
    cypGenotype: string; // e.g. "CYP2C9 *3/*3" or "CYP450 Normal"
  };
  simulationParameters: {
    drugId: string;
    drugGenericName: string;
    brandName?: string;
    baselineDose: string;
    simulatedDose: string;
    intervalHours: number;
    route: string;
  };
  pharmacokineticOutcomes: {
    baselineHalfLife: number; // hours
    simulatedHalfLife: number; // hours
    halfLifeChangeFactor: number; // e.g. 2.39x
    predictedPeakCss: number; // mcg/mL
    upperSafetyCeiling: number; // mcg/mL
    safetyCeilingExceeded: boolean;
    primarySafetyFinding: string;
    guidelineViolationCode?: string;
  };
  clinicianRationale?: string;
  sourceType: 'interactive-simulator' | 'regimen-personalization' | 'preset-assessment';
  clientSessionId?: string;
}

const STORAGE_KEY = 'synthos_simulation_vault_records_v1';

// Benchmark baseline anonymized simulation records for immediate inspection
export const BENCHMARK_ANONYMIZED_RECORDS: AnonymizedSimulationRecord[] = [
  {
    id: 'ANON-SIM-0241',
    timestamp: '2026-10-18T05:14:22.000Z',
    demographicDecade: '60-69 Y',
    biologicalSex: 'Male',
    primaryOrganProfile: {
      egfr: 42,
      egfrStage: 'CKD Stage 3b',
      scr: 1.80,
      crcl: 44.1,
      potassium: 4.9,
      cypGenotype: 'CYP450 Normal'
    },
    simulationParameters: {
      drugId: 'metformin',
      drugGenericName: 'Metformin Hydrochloride',
      brandName: 'Glucophage',
      baselineDose: '1000 mg BID (2000 mg/day)',
      simulatedDose: '500 mg BID (1000 mg/day)',
      intervalHours: 12,
      route: 'Oral'
    },
    pharmacokineticOutcomes: {
      baselineHalfLife: 6.2,
      simulatedHalfLife: 14.8,
      halfLifeChangeFactor: 2.39,
      predictedPeakCss: 1.48,
      upperSafetyCeiling: 2.0,
      safetyCeilingExceeded: false,
      primarySafetyFinding: 'Dose reduced to 1000 mg/day ceiling per KDIGO 2023; peak Css stabilized below 2.0 mcg/mL lactic acidosis hazard threshold.',
      guidelineViolationCode: 'KDIGO-MET-2023'
    },
    clinicianRationale: 'Proactive dose titration for CKD 3b clearance limitation. Averted prospective lactic acidosis toxicity.',
    sourceType: 'regimen-personalization'
  },
  {
    id: 'ANON-SIM-0108',
    timestamp: '2026-10-18T05:32:10.000Z',
    demographicDecade: '70-79 Y',
    biologicalSex: 'Female',
    primaryOrganProfile: {
      egfr: 68,
      egfrStage: 'CKD Stage 2 (Mild)',
      scr: 0.95,
      crcl: 58.2,
      potassium: 4.2,
      cypGenotype: 'CYP2C9 *3/*3 Poor Metabolizer'
    },
    simulationParameters: {
      drugId: 'warfarin',
      drugGenericName: 'Warfarin Sodium',
      brandName: 'Coumadin',
      baselineDose: '5 mg Daily in evening',
      simulatedDose: 'Apixaban 5 mg BID',
      intervalHours: 12,
      route: 'Oral'
    },
    pharmacokineticOutcomes: {
      baselineHalfLife: 40.0,
      simulatedHalfLife: 118.0,
      halfLifeChangeFactor: 2.95,
      predictedPeakCss: 3.4,
      upperSafetyCeiling: 2.5,
      safetyCeilingExceeded: true,
      primarySafetyFinding: 'Profound active S-warfarin accumulation in CYP2C9 *3/*3 genotype; CPIC Level 1A mandates immediate transition to DOAC (Apixaban).',
      guidelineViolationCode: 'CPIC-WARF-2017'
    },
    clinicianRationale: 'Identified pharmacogenomic metabolic failure with INR 3.4 escalation. Transition to factor Xa inhibitor.',
    sourceType: 'interactive-simulator'
  },
  {
    id: 'ANON-SIM-0332',
    timestamp: '2026-10-18T06:05:44.000Z',
    demographicDecade: '80-89 Y',
    biologicalSex: 'Male',
    primaryOrganProfile: {
      egfr: 52,
      egfrStage: 'CKD Stage 3a',
      scr: 1.40,
      crcl: 46.8,
      potassium: 4.4,
      cypGenotype: 'CYP2C19 Intermediate'
    },
    simulationParameters: {
      drugId: 'citalopram',
      drugGenericName: 'Citalopram Hydrobromide',
      brandName: 'Celexa',
      baselineDose: '40 mg Daily in morning',
      simulatedDose: '20 mg Daily in morning',
      intervalHours: 24,
      route: 'Oral'
    },
    pharmacokineticOutcomes: {
      baselineHalfLife: 35.0,
      simulatedHalfLife: 62.0,
      halfLifeChangeFactor: 1.77,
      predictedPeakCss: 68.0,
      upperSafetyCeiling: 50.0,
      safetyCeilingExceeded: false,
      primarySafetyFinding: 'Citalopram 40mg exceeds FDA geriatric ceiling for age >60; reduced to 20mg daily to mitigate concentration-dependent QTc prolongation.',
      guidelineViolationCode: 'FDA-CIT-2012'
    },
    clinicianRationale: 'Geriatric safety protocol adherence per 2023 AGS Beers Criteria and FDA safety communication.',
    sourceType: 'preset-assessment'
  }
];

// Session storage keys for admin token
const ADMIN_TOKEN_KEY = 'synthos_admin_session_token';
const ADMIN_EMAIL_KEY = 'synthos_admin_session_email';

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAdminEmail(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function isUserAdminAuthenticated(): boolean {
  return !!getAdminToken();
}

export function setAdminSessionToken(email: string = 'sivasyam05@gmail.com'): void {
  try {
    const token = btoa(`${email}:${Date.now()}:authorized`);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_EMAIL_KEY, email);
  } catch {
    // ignore
  }
}

export function logoutAdmin(): void {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_EMAIL_KEY);
  } catch {
    // ignore
  }
}

export async function adminLogin(email: string, accessKey: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const normEmail = email.trim().toLowerCase();
  const normKey = accessKey.trim();

  try {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, accessKey: normKey })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      sessionStorage.setItem(ADMIN_EMAIL_KEY, data.adminEmail || normEmail);
      return { success: true, message: data.message };
    }
    if (data.error) {
      return { success: false, error: data.error };
    }
    return { success: false, error: 'Authentication failed.' };
  } catch (err: any) {
    return { success: false, error: 'Admin authentication service is unavailable. Try again later.' };
  }
}

export interface AdminTelemetrySummary {
  totalSimulations: number;
  safetyViolations: number;
  safeTitrations: number;
  uniqueSessions: number;
  topDrugs: { name: string; count: number }[];
  lastUpdated: string;
}

export interface AdminTelemetryResponse {
  success: boolean;
  records: AnonymizedSimulationRecord[];
  summary: AdminTelemetrySummary;
  error?: string;
}

export async function fetchAdminTelemetryFromServer(): Promise<AdminTelemetryResponse> {
  const token = getAdminToken();
  if (!token) {
    throw new Error('Not authenticated as administrator. Please log in.');
  }

  const res = await fetch('/api/admin/telemetry', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      logoutAdmin();
      throw new Error('Admin session expired or access unauthorized. Please re-authenticate.');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch telemetry from server database.');
  }

  return await res.json();
}

export async function resetServerTelemetryDatabase(): Promise<{ success: boolean; message?: string }> {
  const token = getAdminToken();
  if (!token) throw new Error('Admin credentials required.');

  const res = await fetch('/api/admin/clear', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset database.');
  return data;
}

export function getStoredSimulationRecords(): AnonymizedSimulationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(BENCHMARK_ANONYMIZED_RECORDS));
      return BENCHMARK_ANONYMIZED_RECORDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : BENCHMARK_ANONYMIZED_RECORDS;
  } catch {
    return BENCHMARK_ANONYMIZED_RECORDS;
  }
}

export function saveAnonymizedSimulationRecord(record: Omit<AnonymizedSimulationRecord, 'id' | 'timestamp'>): AnonymizedSimulationRecord {
  const records = getStoredSimulationRecords();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newRecord: AnonymizedSimulationRecord = {
    ...record,
    id: `ANON-SIM-${randomSuffix}`,
    timestamp: new Date().toISOString()
  };

  // 1. Update localStorage cache
  const updated = [newRecord, ...records];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to store simulation record to localStorage:', e);
  }

  // 2. Transmit asynchronously to secure server database
  try {
    fetch('/api/telemetry/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    }).catch((err) => {
      // Non-blocking log catch
      console.warn('Telemetry server sync pending or offline:', err);
    });
  } catch {
    // Non-blocking
  }

  return newRecord;
}

export function exportSimulationVaultToJson(): void {
  const records = getStoredSimulationRecords();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `SYNTHOS_Anonymized_Simulations_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportSimulationVaultToCsv(): void {
  const records = getStoredSimulationRecords();
  const headers = [
    'AnonymizedID',
    'Timestamp',
    'AgeDecade',
    'BiologicalSex',
    'eGFR',
    'eGFRStage',
    'SerumCreatinine',
    'CrCl',
    'CYPGenotype',
    'DrugGenericName',
    'SimulatedDose',
    'BaselineHalfLife_h',
    'SimulatedHalfLife_h',
    'HalfLifeChangeFactor',
    'PredictedPeakCss',
    'UpperSafetyCeiling',
    'SafetyCeilingExceeded',
    'GuidelineViolationCode',
    'SourceType'
  ];

  const rows = records.map((r) => [
    r.id,
    r.timestamp,
    r.demographicDecade,
    r.biologicalSex,
    r.primaryOrganProfile.egfr,
    `"${r.primaryOrganProfile.egfrStage}"`,
    r.primaryOrganProfile.scr,
    r.primaryOrganProfile.crcl,
    `"${r.primaryOrganProfile.cypGenotype}"`,
    `"${r.simulationParameters.drugGenericName}"`,
    `"${r.simulationParameters.simulatedDose}"`,
    r.pharmacokineticOutcomes.baselineHalfLife,
    r.pharmacokineticOutcomes.simulatedHalfLife,
    r.pharmacokineticOutcomes.halfLifeChangeFactor,
    r.pharmacokineticOutcomes.predictedPeakCss,
    r.pharmacokineticOutcomes.upperSafetyCeiling,
    r.pharmacokineticOutcomes.safetyCeilingExceeded ? 'YES' : 'NO',
    `"${r.pharmacokineticOutcomes.guidelineViolationCode || 'NONE'}"`,
    r.sourceType
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodeURI(csvContent));
  downloadAnchor.setAttribute('download', `SYNTHOS_DeIdentified_Simulation_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function clearSimulationVault(): void {
  localStorage.removeItem(STORAGE_KEY);
}

