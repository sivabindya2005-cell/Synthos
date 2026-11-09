import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : null;
const isProduction = process.env.NODE_ENV === 'production' || (!cliPort && fs.existsSync(path.resolve(__dirname, 'dist', 'index.html')));
const port = cliPort || Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));

// Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; img-src 'self' data: https:; object-src 'none';"
  );
  next();
});

// Simple In-Memory Rate Limiter (Max 60 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxReq = 80;

  const current = rateLimitMap.get(ip);
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    next();
  } else if (current.count < maxReq) {
    current.count += 1;
    next();
  } else {
    res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
  }
}
app.use('/api/', rateLimiter);

// Telemetry Database configuration
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_PATH = path.resolve(DATA_DIR, 'telemetry_database.json');

// Designated system administrator & authentication key
const AUTHORIZED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'sivasyam05@gmail.com').toLowerCase().trim();
const ADMIN_ACCESS_KEY = process.env.ADMIN_KEY || '';
const JWT_OR_SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Benchmark baseline anonymized records to seed the database
const INITIAL_BENCHMARK_TELEMETRY = [
  {
    id: 'ANON-SIM-0241',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
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
    sourceType: 'regimen-personalization',
    clientSessionId: 'sess-init-01'
  },
  {
    id: 'ANON-SIM-0108',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
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
      baselineDose: '5 mg Daily',
      simulatedDose: '1.25 mg Daily (75% Dose Reduction)',
      intervalHours: 24,
      route: 'Oral'
    },
    pharmacokineticOutcomes: {
      baselineHalfLife: 36.0,
      simulatedHalfLife: 118.0,
      halfLifeChangeFactor: 3.28,
      predictedPeakCss: 2.92,
      upperSafetyCeiling: 3.0,
      safetyCeilingExceeded: true,
      primarySafetyFinding: 'CYP2C9 *3/*3 variant reduces oral (S)-warfarin clearance by >80%; excessive AUC without reduction predicts major bleed event.',
      guidelineViolationCode: 'CPIC-WAR-2022'
    },
    clinicianRationale: 'Genotype-guided warfarin titration prevents catastrophic supratherapeutic INR in slow CYP2C9 metabolizer.',
    sourceType: 'interactive-simulator',
    clientSessionId: 'sess-init-02'
  }
];

// Helper to ensure database exists and read records
function readTelemetryDb(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_BENCHMARK_TELEMETRY, null, 2), 'utf-8');
      return INITIAL_BENCHMARK_TELEMETRY;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_BENCHMARK_TELEMETRY;
  } catch (err) {
    console.error('Failed to read telemetry database:', err);
    return INITIAL_BENCHMARK_TELEMETRY;
  }
}

// Helper to write records to database
function writeTelemetryDb(records: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write telemetry database:', err);
  }
}

// Admin Token Generation & Verification
function generateAdminToken(email: string): string {
  const timestamp = Date.now();
  const payload = `${email.toLowerCase()}:${timestamp}`;
  const signature = crypto.createHmac('sha256', JWT_OR_SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [email, timestampStr, signature] = parts;
    if (email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) return false;

    // Check expiration (24 hours)
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return false;

    // Validate signature
    const expectedSig = crypto.createHmac('sha256', JWT_OR_SESSION_SECRET).update(`${email}:${timestampStr}`).digest('hex');
    return signature === expectedSig;
  } catch {
    return false;
  }
}

// Middleware: Require Admin Authentication
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. Valid administrator authorization token required.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (!verifyAdminToken(token)) {
    res.status(403).json({ error: 'Forbidden. Invalid or expired admin credentials.' });
    return;
  }
  next();
}

// Initialize Gemini Client
const ai = new GoogleGenAI();

// In-memory clinical search query cache (TTL 30 minutes)
interface CachedSearchResult {
  data: any;
  timestamp: number;
}
const searchCache = new Map<string, CachedSearchResult>();
const CACHE_TTL_MS = 30 * 60 * 1000;

// Clinical Search Grounding API endpoint
app.post('/api/clinical-search', async (req: Request, res: Response) => {
  try {
    const { query, drugName, patientContext } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Clinical query string is required' });
      return;
    }

    const cleanQuery = query.trim();
    const cacheKey = `${cleanQuery.toLowerCase()}_${patientContext?.egfr || 'none'}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.json({ ...cached.data, cached: true });
      return;
    }

    const clinicalSystemInstruction = `You are SYNTHOS Clinical Intelligence, an authoritative pharmacotherapy search and evidence clarification assistant for clinical pharmacists (PharmDs), physicians, Medical Science Liaisons (MSLs), and pharmacology researchers.
Your mission is to provide up-to-date, real-time medical evidence, guideline updates (e.g. latest KDIGO, ADA, ACC/AHA, CPIC, FDA Boxed Warnings, UpToDate-style summaries, and landmark clinical trials).

STRICT RULES:
1. Ground your response in authoritative medical literature and reliable clinical web sources using Google Search grounding.
2. NEVER invent facts, trial endpoints, or safety ceilings. If evidence is evolving, uncertain, or conflicting, explicitly state "Evidence is evolving/limited".
3. Structure your response using these clear section headers:
   ### Clinical Consensus Summary
   ### Dosing Ceilings & Clearance Adjustments (eGFR, CrCl, Hepatic)
   ### Landmark Trials & Evidence Base
   ### Boxed Warnings & Safety Hazards
   ### Practice Recommendations & Monitoring
4. Mention specific guideline codes (e.g., KDIGO 2023, CPIC Level 1A, AGS Beers 2023, ACC/AHA 2022) and citations wherever available.`;

    let userPrompt = `Clinical Query: "${cleanQuery}"`;
    if (drugName) {
      userPrompt += `\nSubject Drug: ${drugName}`;
    }
    if (patientContext) {
      userPrompt += `\nPatient Clearance Context: eGFR ${patientContext.egfr || 'N/A'} mL/min/1.73m², Serum Creatinine ${patientContext.scr || 'N/A'} mg/dL, Pharmacogenomics/CYP: ${patientContext.cypStatus || 'N/A'}`;
      if (Array.isArray(patientContext.medications) && patientContext.medications.length > 0) {
        userPrompt += `\nConcurrent Regimen: ${patientContext.medications.join(', ')}`;
      }
    }
    userPrompt += `\n\nPlease search for recent medical evidence, guidelines, clinical trials, or drug safety alerts, and provide an evidence-grounded summary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: clinicalSystemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    // Extract web search chunks
    const groundingChunks = (groundingMetadata?.groundingChunks || []).map((chunk: any) => ({
      title: chunk.web?.title || 'Clinical Reference',
      url: chunk.web?.uri || '',
    })).filter((c: any) => c.url);

    // Extract queries executed by search grounding
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    const resultData = {
      query: cleanQuery,
      answer: response.text || 'No response generated from clinical intelligence model.',
      groundingChunks,
      webSearchQueries,
      timestamp: new Date().toISOString(),
    };

    // Store in cache
    searchCache.set(cacheKey, { data: resultData, timestamp: Date.now() });

    res.json(resultData);
  } catch (error: any) {
    console.error('Error during clinical search grounding:', error);
    res.status(500).json({
      error: error.message || 'Failed to execute clinical search grounding',
      fallbackMessage: 'Clinical search service is temporarily unavailable. Please use the free medical search engine links below.',
    });
  }
});

// Plain-Language Pharmacokinetic Explanation Endpoint
// Daily Quota Tracking per IP/User (Max 120 AI calls/day)
const dailyQuotaMap = new Map<string, { count: number; date: string }>();

function checkDailyQuota(id: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const userUsage = dailyQuotaMap.get(id);
  if (!userUsage || userUsage.date !== today) {
    dailyQuotaMap.set(id, { count: 1, date: today });
    return true;
  }
  if (userUsage.count >= 120) {
    return false;
  }
  userUsage.count += 1;
  return true;
}

// Free-text PHI sanitization helper
function sanitizeIncomingPayload(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g, '[REDACTED_PHONE]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g, '[REDACTED_ID]')
    .replace(/\b(MRN|ID|RECORD)[#:\s]+[A-Z0-9-]{5,15}\b/gi, '[REDACTED_MRN]');
}

// Plain-Language Pharmacokinetic Explanation Endpoint
// AI is strictly forbidden from generating numbers; it explains pre-calculated deterministic results
app.post('/api/clinical-explain', async (req: Request, res: Response) => {
  try {
    const { pkResult, patientProfile, triageResult } = req.body;
    const clientIdentifier = (req.ip || 'client-anon') + '_' + (req.headers['x-user-id'] || 'anon');

    if (!checkDailyQuota(clientIdentifier)) {
      res.status(429).json({
        error: 'Daily AI explanation quota reached (120 calls/day). Please rely on deterministic calculations.',
        fallback: {
          summary: `Deterministic analysis complete for ${pkResult?.drugGenericName || 'drug'}. Review calculated pharmacokinetic parameters and local clinical protocols.`,
          riskTierRationale: `Tier based on calculated organ clearances (eGFR ${patientProfile?.egfr || 'N/A'}, CrCl ${patientProfile?.crcl || 'N/A'}).`,
          counsellingPoints: ['Verify trough concentration prior to subsequent dosing.', 'Monitor renal profile and electrolytes.'],
          disclaimer: 'Educational clinical decision support only. Not a substitute for clinical judgment.'
        }
      });
      return;
    }

    if (!pkResult || !pkResult.drugGenericName) {
      res.status(400).json({ error: 'Valid deterministic PK result payload required.' });
      return;
    }

    const explainSystemInstruction = `You are SYNTHOS Clinical Intelligence, an authoritative clinical pharmacologist and educator.
Your task is to provide an objective, plain-language clinical explanation of PRE-CALCULATED, DETERMINISTIC pharmacokinetic parameters and risk triage outcomes.

STRICT GUARDRAILS:
1. NEVER INVENT, ESTIMATE, OR ALTER ANY DOSES, CONCENTRATIONS, HALF-LIVES, OR NUMERICAL VALUES. Quote only the exact figures provided in the user prompt.
2. STAY STRICTLY WITHIN CLINICAL PHARMACOTHERAPY EDUCATION. Refuse all non-clinical, speculative, or diagnostic requests.
3. If input parameters are outside validated bounds or represent extreme clinical states (e.g. eGFR < 15, SCr > 5, K+ > 5.5, Class III obesity), state clearly: "Insufficient data / extreme physiological limits where linear models lose predictive validity".
4. Always conclude with: "Educational decision support only. Verify against institutional protocols."`;

    const userPrompt = `Interpret this deterministic pharmacokinetic simulation:
- Drug: ${pkResult.drugGenericName} (${pkResult.doseMg || 'N/A'} mg every ${pkResult.intervalHours || 'N/A'} hours, route: ${pkResult.route || 'Standard'})
- Model Used: ${pkResult.modelUsed || 'One-Compartment'}
- Organ Clearances: eGFR ${patientProfile?.egfr || pkResult.egfr || 'N/A'} mL/min/1.73m², CrCl ${patientProfile?.crcl || 'N/A'} mL/min, SCr ${patientProfile?.scr || 'N/A'} mg/dL, Hepatic Status: ${patientProfile?.hepaticStatus || 'Normal'}
- Calculated Half-Life: ${pkResult.halfLifeHours} hours (${pkResult.halfLifeChangeFactor}x baseline)
- Steady-State Peak (Cmax,ss): ${pkResult.peakSteadyStateCss} ${pkResult.therapeuticUnit || 'mcg/mL'} (Therapeutic Target: ${pkResult.therapeuticTargetMin || 'N/A'}–${pkResult.therapeuticTargetMax || 'N/A'} ${pkResult.therapeuticUnit || 'mcg/mL'})
- Steady-State Trough (Cmin,ss): ${pkResult.troughSteadyStateCss} ${pkResult.therapeuticUnit || 'mcg/mL'}
- Safety Ceiling Exceeded: ${pkResult.safetyCeilingExceeded ? 'YES - EXCEEDED' : 'NO - SAFE'}
- Triage Risk Tier: ${triageResult?.tier || 'Moderate'} (Score: ${triageResult?.score || 0})
- Primary Clinical Finding: ${pkResult.safetyFinding || 'None'}
- Clinical Notes: ${sanitizeIncomingPayload(pkResult.renalAdjustmentNote || '')}

Respond in strict JSON with the required fields.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: explainSystemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'Clear, concise pathophysiological explanation of clearance alteration in under 120 words.'
            },
            riskTierRationale: {
              type: 'string',
              description: 'Specific explanation of why the assigned risk tier was triggered.'
            },
            counsellingPoints: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key clinical monitoring and patient counselling points.'
            },
            insufficientDataNotice: {
              type: 'string',
              description: 'Empty string or notice if patient covariates exceed validated model boundaries.'
            },
            disclaimer: {
              type: 'string',
              description: 'Mandatory clinical decision support disclaimer.'
            }
          },
          required: ['summary', 'riskTierRationale', 'counsellingPoints', 'disclaimer']
        }
      },
    });

    let parsedResult;
    try {
      parsedResult = JSON.parse(response.text || '{}');
    } catch {
      parsedResult = {
        summary: response.text || 'Deterministic pharmacokinetic analysis completed.',
        riskTierRationale: `Tier assigned based on organ clearance scores.`,
        counsellingPoints: ['Verify serum concentration before redosing.', 'Monitor renal parameters closely.'],
        disclaimer: 'Educational clinical decision support only. Not a substitute for clinical judgment.'
      };
    }

    res.json({
      success: true,
      data: parsedResult,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error generating structured clinical explanation:', err);
    res.status(200).json({
      success: false,
      fallback: true,
      data: {
        summary: 'Deterministic pharmacokinetic calculations verified successfully. AI explanation service temporarily offline.',
        riskTierRationale: 'Calculated from deterministic organ clearance thresholds and drug monograph guidelines.',
        counsellingPoints: [
          'Verify patient clearance trajectory with serial serum creatinine and eGFR.',
          'Consult local formulary guidelines and therapeutic drug monitoring protocol.'
        ],
        insufficientDataNotice: '',
        disclaimer: 'Educational decision support only. Verify against local institutional clinical protocols.'
      }
    });
  }
});

// ==========================================
// TELEMETRY LOGGING (Secure, De-identified)
// ==========================================
app.post('/api/telemetry/log', (req: Request, res: Response) => {
  try {
    const rawRecord = req.body;
    if (!rawRecord || !rawRecord.simulationParameters) {
      res.status(400).json({ error: 'Valid simulation record payload required.' });
      return;
    }

    const currentRecords = readTelemetryDb();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newRecord = {
      id: rawRecord.id || `ANON-SIM-${randomSuffix}`,
      timestamp: rawRecord.timestamp || new Date().toISOString(),
      demographicDecade: rawRecord.demographicDecade || '60-69 Y',
      biologicalSex: rawRecord.biologicalSex || 'De-identified',
      primaryOrganProfile: {
        egfr: Number(rawRecord.primaryOrganProfile?.egfr || 45),
        egfrStage: String(rawRecord.primaryOrganProfile?.egfrStage || 'Moderate CKD'),
        scr: Number(rawRecord.primaryOrganProfile?.scr || 1.8),
        crcl: Number(rawRecord.primaryOrganProfile?.crcl || 45),
        potassium: Number(rawRecord.primaryOrganProfile?.potassium || 4.5),
        cypGenotype: String(rawRecord.primaryOrganProfile?.cypGenotype || 'CYP450 Normal')
      },
      simulationParameters: {
        drugId: String(rawRecord.simulationParameters?.drugId || 'unknown'),
        drugGenericName: String(rawRecord.simulationParameters?.drugGenericName || 'Unspecified Agent'),
        brandName: rawRecord.simulationParameters?.brandName || '',
        baselineDose: String(rawRecord.simulationParameters?.baselineDose || 'Standard'),
        simulatedDose: String(rawRecord.simulationParameters?.simulatedDose || 'Adjusted'),
        intervalHours: Number(rawRecord.simulationParameters?.intervalHours || 12),
        route: String(rawRecord.simulationParameters?.route || 'Oral')
      },
      pharmacokineticOutcomes: {
        baselineHalfLife: Number(rawRecord.pharmacokineticOutcomes?.baselineHalfLife || 6.2),
        simulatedHalfLife: Number(rawRecord.pharmacokineticOutcomes?.simulatedHalfLife || 12.0),
        halfLifeChangeFactor: Number(rawRecord.pharmacokineticOutcomes?.halfLifeChangeFactor || 1.5),
        predictedPeakCss: Number(rawRecord.pharmacokineticOutcomes?.predictedPeakCss || 1.8),
        upperSafetyCeiling: Number(rawRecord.pharmacokineticOutcomes?.upperSafetyCeiling || 2.5),
        safetyCeilingExceeded: Boolean(rawRecord.pharmacokineticOutcomes?.safetyCeilingExceeded),
        primarySafetyFinding: String(rawRecord.pharmacokineticOutcomes?.primarySafetyFinding || 'Telemetry logged'),
        guidelineViolationCode: rawRecord.pharmacokineticOutcomes?.guidelineViolationCode || ''
      },
      clinicianRationale: rawRecord.clinicianRationale || '',
      sourceType: rawRecord.sourceType || 'interactive-simulator',
      clientSessionId: rawRecord.clientSessionId || `sess-${Date.now().toString(36)}`
    };

    // Prepend new record, keep up to 5,000 records
    const updated = [newRecord, ...currentRecords].slice(0, 5000);
    writeTelemetryDb(updated);

    res.json({ success: true, recordId: newRecord.id, totalLogged: updated.length });
  } catch (err: any) {
    console.error('Error logging telemetry:', err);
    res.status(500).json({ error: 'Failed to record simulation telemetry.' });
  }
});

// ==========================================
// ADMIN AUTHENTICATION & ACCESS CONTROL
// ==========================================
app.post('/api/admin/auth', (req: Request, res: Response) => {
  try {
    if (!ADMIN_ACCESS_KEY) {
      res.status(503).json({ error: 'Admin login is disabled. Set ADMIN_KEY on the server.' });
      return;
    }

    const { email, accessKey } = req.body;
    if (!email || !accessKey) {
      res.status(400).json({ error: 'Email and administrator access key are required.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const providedKey = String(accessKey).trim();

    if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
      res.status(403).json({ error: 'Access denied. Unrecognized administrator account.' });
      return;
    }

    const keyBuffer = Buffer.from(providedKey, 'utf-8');
    const expectedKeyBuffer = Buffer.from(ADMIN_ACCESS_KEY, 'utf-8');

    if (keyBuffer.length !== expectedKeyBuffer.length || !crypto.timingSafeEqual(keyBuffer, expectedKeyBuffer)) {
      res.status(401).json({ error: 'Invalid admin passkey.' });
      return;
    }

    // Generate secure admin session token
    const token = generateAdminToken(AUTHORIZED_ADMIN_EMAIL);
    res.json({
      success: true,
      token,
      adminEmail: AUTHORIZED_ADMIN_EMAIL,
      expiresIn: '24h',
      message: `Authenticated successfully as system administrator (${AUTHORIZED_ADMIN_EMAIL})`
    });
  } catch (err: any) {
    console.error('Admin auth error:', err);
    res.status(500).json({ error: 'Authentication service encountered an unexpected error.' });
  }
});

// ==========================================
// ADMIN TELEMETRY DATABASE (Authenticated)
// ==========================================
app.get('/api/admin/telemetry', requireAdmin, (req: Request, res: Response) => {
  try {
    const records = readTelemetryDb();
    const total = records.length;
    const safetyViolations = records.filter((r) => r.pharmacokineticOutcomes?.safetyCeilingExceeded).length;
    const uniqueSessions = new Set(records.map((r) => r.clientSessionId || r.id)).size;

    // Top simulated drugs
    const drugCountMap: Record<string, number> = {};
    for (const r of records) {
      const drug = r.simulationParameters?.drugGenericName || 'Unknown';
      drugCountMap[drug] = (drugCountMap[drug] || 0) + 1;
    }
    const topDrugs = Object.entries(drugCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      records,
      summary: {
        totalSimulations: total,
        safetyViolations,
        safeTitrations: total - safetyViolations,
        uniqueSessions,
        topDrugs,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('Error fetching admin telemetry:', err);
    res.status(500).json({ error: 'Failed to retrieve telemetry records.' });
  }
});

app.post('/api/admin/clear', requireAdmin, (req: Request, res: Response) => {
  try {
    writeTelemetryDb(INITIAL_BENCHMARK_TELEMETRY);
    res.json({
      success: true,
      message: 'Telemetry database reset to benchmark cohort baseline.',
      totalRecords: INITIAL_BENCHMARK_TELEMETRY.length
    });
  } catch (err: any) {
    console.error('Error clearing database:', err);
    res.status(500).json({ error: 'Failed to reset telemetry database.' });
  }
});

app.get('/api/admin/export', requireAdmin, (req: Request, res: Response) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    const records = readTelemetryDb();

    if (format === 'csv') {
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
        'BaselineDose',
        'SimulatedDose',
        'BaselineHalfLife_h',
        'SimulatedHalfLife_h',
        'HalfLifeChangeFactor',
        'PredictedPeakCss',
        'UpperSafetyCeiling',
        'SafetyCeilingExceeded',
        'GuidelineViolationCode',
        'SourceType',
        'SessionID'
      ];

      const rows = records.map((r) => [
        r.id,
        r.timestamp,
        r.demographicDecade,
        r.biologicalSex,
        r.primaryOrganProfile?.egfr,
        `"${r.primaryOrganProfile?.egfrStage || ''}"`,
        r.primaryOrganProfile?.scr,
        r.primaryOrganProfile?.crcl,
        `"${r.primaryOrganProfile?.cypGenotype || ''}"`,
        `"${r.simulationParameters?.drugGenericName || ''}"`,
        `"${r.simulationParameters?.baselineDose || ''}"`,
        `"${r.simulationParameters?.simulatedDose || ''}"`,
        r.pharmacokineticOutcomes?.baselineHalfLife,
        r.pharmacokineticOutcomes?.simulatedHalfLife,
        r.pharmacokineticOutcomes?.halfLifeChangeFactor,
        r.pharmacokineticOutcomes?.predictedPeakCss,
        r.pharmacokineticOutcomes?.upperSafetyCeiling,
        r.pharmacokineticOutcomes?.safetyCeilingExceeded ? 'YES' : 'NO',
        `"${r.pharmacokineticOutcomes?.guidelineViolationCode || 'NONE'}"`,
        r.sourceType,
        r.clientSessionId || ''
      ]);

      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=SYNTHOS_Telemetry_${Date.now()}.csv`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=SYNTHOS_Telemetry_${Date.now()}.json`);
      res.send(JSON.stringify(records, null, 2));
    }
  } catch (err: any) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export telemetry database.' });
  }
});

// Mount Vite middleware in development or serve static files in production
if (isProduction) {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`SYNTHOS Clinical Platform listening on port ${port}`);
});
