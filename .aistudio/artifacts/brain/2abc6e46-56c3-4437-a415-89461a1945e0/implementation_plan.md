# SYNTHOS: Clinical Decision Support Matrix & Pharmacokinetic Digital Twin

SYNTHOS ("Where Biology Meets Its Other Self") is an educational and professional clinical decision support (CDS) platform and pharmacometrics digital twin. It enables clinicians, clinical pharmacists, and medical science liaisons to simulate concentration-time profiles, model organ clearance constraints (renal, hepatic, pharmacogenomics), evaluate drug-drug interaction matrices, and inspect deterministic titration bounds without ever exposing clinical math to probabilistic AI hallucinations.

> [!IMPORTANT]
> **User Review & Confirmed Implementation Decisions:**
> - **Workflow Architecture**: Guided 3-step simulation wizard (1. Patient Covariates & Clearance -> 2. Drug Selection & Regimen -> 3. Multi-Model Curve & Triage Matrix) presented as the primary streamlined workflow on launch, with instant toggle to the full multi-organ clinical workstation.
> - **Pharmacokinetic Model Selection**: Auto-selected based on the selected drug's biophysical monograph (e.g. IV bolus for aminoglycosides, first-order oral for theophylline/paracetamol, infusion for vancomycin, Michaelis-Menten saturable kinetics for phenytoin), paired with an explicit manual override toggle.
> - **Drug Formulary Scope**: Versioned starter dataset of 7 deep-dive validated narrow-therapeutic-index (NTI) drugs (Gentamicin, Vancomycin, Digoxin, Phenytoin, Theophylline, Lithium, Paracetamol) with exhaustive renal/hepatic rules, CPIC genotypes, and citations, backed by an indexed compendium of 300+ clinical agents.
> - **PHI Guardrail & Data Minimization**: Strict client-side and server-side regex screening rejecting identifiers (phone numbers, emails, MRNs, SSNs, dates of birth), enforcing de-identified/synthetic cases only.

---

## 1. Overview & Core Concept

- **What It Does**: Deterministically calculates individual patient pharmacokinetic parameters ($k_e$, $t_{1/2}$, $V_d$, $CL$, $C_{max,ss}$, $C_{min,ss}$, $C_{ss,avg}$, $AUC_\tau$, accumulation ratio $R$) across IV bolus, infusion, first-order oral absorption, saturable Michaelis-Menten, and two-compartment models. Automatically triages cases across a 4-tier decision matrix (Low, Moderate, High, Critical) with transparent factor attribution. AI (Gemini 3.8 Flash via secure server proxy) generates plain-language pathophysiological rationales without ever producing or altering numbers.
- **Target Audience**: Clinical pharmacists (PharmD, BCPS), nephrologists, intensivists, pharmacology educators, and clinical fellows.
- **Safety & Regulatory Positioning**: Clearly positioned as an educational and clinical decision support tool for qualified professionals under Section 520(o)(1)(E) of the FD&C Act. It does not replace clinical judgment and is not a certified medical device.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **First-Login Consent & Positioning Gate**: First-time users accept the educational CDS terms of use, confirming synthetic/de-identified data entry only. Persistent disclaimer in footer and results views.
2. **Guided 3-Step Simulation Wizard**:
   - *Step 1: Patient Covariates*: Age, biological sex, total body weight (TBW), height, serum creatinine, potassium, Child-Pugh class (A/B/C), pregnancy/lactation, relevant comorbidities, and CPIC genotype. Real-time auto-calculation of BMI, Devine IBW, Adjusted Body Weight ($IBW + 0.4 \times (TBW - IBW)$), BSA, Cockcroft-Gault $CrCl$ (with explicit weight selection), and 2021 race-free CKD-EPI $eGFR$.
   - *Step 2: Drug & Regimen Calibration*: Select from the 7 validated core drugs or search 300+ agents. Route (IV bolus, IV infusion with infusion time, oral with $F$ and $k_a$, saturable oral/IV), dose ($mg$), interval ($\tau$ hours), target therapeutic window.
   - *Step 3: Multi-Faceted Results & Decision Matrix*: Interactive concentration-time curve with shaded therapeutic range and toxic threshold; tabular deterministic PK parameters with exact formulas and literature citations; transparent 4-tier risk triage breakdown; drug-drug interaction matrix; and on-demand streamed plain-language pathophysiological summary from Gemini with graceful offline fallback.
3. **Clinical Workstation & Digital Twin Mode**: Side-by-side simulation comparison (e.g. standard regimen vs. renal-adjusted titration), history log with search/filter, and one-click PDF/CSV export containing formulas, assumptions, and disclaimers.
4. **Data Governance & DPDP Act 2023 Panel**: Users can view their stored cases, export all personal data (JSON/CSV), or execute a permanent single-click account and data erasure.

### Pastel Design System
- **Light Palette**:
  - Background Canvas: `#FBF9FF`
  - Structural Surface: `#FFFFFF` with hairline border `#E9E3F5`
  - Primary Lavender: `#CDB4DB`
  - Interactive Accent: `#7C6BC4` (with crisp white text)
  - Secondary Accents: Sky `#BDE0FE`, Baby Pink `#FFC8DD`, Mint `#B5EAD7`, Peach `#FFDAC1`, Butter `#FDF2B3`
  - Typography: Text `#2E2A47`, Muted Text `#6B6688`
- **Dark Palette**:
  - Background Canvas: `#1E1B2E`
  - Structural Surface: `#2A2640` with hairline border `#3D3759`
  - Accents: Desaturated pastels with high contrast ratio
  - Typography: Text `#F2EFFA`, Muted Text `#A8A3C5`
- **Risk Tiers (Non-Hue-Only)**:
  - **Low**: Mint `#B5EAD7` with checkmark icon and "LOW RISK" text label
  - **Moderate**: Butter `#FDF2B3` with caution triangle icon and "MODERATE RISK" text label
  - **High**: Peach `#FFDAC1` with warning shield icon and "HIGH RISK" text label
  - **Critical**: Rose `#F4A6B8` with bold border, alert octagon icon, and "CRITICAL RISK" text label
- **Geometry & Typography**: 16px card border radius, 12px input radius, pill buttons, soft dual-pastel gradients in hero ribbons, Plus Jakarta Sans / DM Sans for UI labels, and dedicated monospace tabular numerals (`font-mono tabular-nums`) for all biometric and pharmacokinetic figures.

---

## 3. Key Product Decisions & Trade-Offs

- **Deterministic Core vs. Probabilistic AI**:
  - *Chosen Approach*: 100% of pharmacokinetic formulas, renal clearances, accumulations, and doses run in deterministic TypeScript code with rigorous unit test verification. The Gemini API is called strictly through a server proxy (`/api/clinical-explain`) with a structured JSON schema to interpret the pre-computed numbers in plain language.
  - *Why*: Eliminates hallucinated drug doses, invalid units, or mathematical drift in clinical decision support.
- **Model Flexibility vs. Simplicity**:
  - *Chosen Approach*: Auto-select standard model based on drug monograph (e.g., Vancomycin $\to$ IV infusion, Phenytoin $\to$ Michaelis-Menten saturable, Theophylline $\to$ Oral 1st-order) with an intuitive manual override dropdown allowing two-compartment or alternate route exploration.
  - *Why*: Streamlines fast clinical entries while empowering clinical pharmacometricians to run advanced non-linear simulations.
- **Security & Privacy by Design (DPDP Act 2023 & HIPAA)**:
  - *Chosen Approach*: Client and server regex interceptors block identifiable data before saving. Firestore documents record only synthetic case IDs, de-identified parameters, and owner UIDs. Zero patient identifiers stored.
  - *Why*: Guarantees data minimization, privacy compliance, and safe educational sharing.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SYNTHOS Frontend (React SPA)                    │
│                                                                        │
│  ┌──────────────────────────┐    ┌──────────────────────────────────┐  │
│  │ Guided 3-Step Simulation │    │ Full Multi-Organ Workstation     │  │
│  │ - Patient Covariates     │    │ - 16 Clinical Views & Compendium │  │
│  │ - Drug & Regimen         │    │ - Digital Twin Titration Curves  │  │
│  │ - Multi-Model Curve      │    │ - Drug-Drug Interaction Matrix   │  │
│  └─────────────┬────────────┘    └────────────────┬─────────────────┘  │
│                │                                  │                    │
│                ▼                                  ▼                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Deterministic Pharmacokinetic Engine (src/utils/clinicalMath.ts) │  │
│  │ - Cockcroft-Gault (IBW/AdjBW) & 2021 CKD-EPI (Race-Free)         │  │
│  │ - IV Bolus, Infusion, Oral (F, ka), Michaelis-Menten, 2-Compartment│
│  │ - Multi-Dose Steady-State Accumulation (R, Cmax, Cmin, Css_avg)  │  │
│  │ - Automated Unit-Test Suite (Gentamicin, Phenytoin, Digoxin, CG) │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│ Express Server (server.ts)    │               │ Firebase Cloud Services       │
│ - Security Headers & CSP      │               │ - Firebase Auth (Email/Google)│
│ - Rate Limiting & Quotas      │               │ - Firestore (Cases & Audits)  │
│ - PHI Sanitization Pipeline   │               │ - Role-Based Security Rules   │
│ - /api/clinical-explain (AI)  │               │ - Strict UID Data Isolation   │
│ - /api/clinical-search (Lit)  │               └───────────────────────────────┘
│ - Google GenAI Server Client  │
└───────────────────────────────┘
```

### Data Model & Entities
1. **Drug Monograph (`src/data/drugs.json`)**:
   - `id`, `name`, `brandName`, `class`, `route`, `bioavailability` ($F$), `volumeOfDistributionLperKg` ($V_d$), `clearanceLperHperKg` ($CL$), `fractionExcretedUnchanged` ($f_e$), `eliminationHalfLifeHours` ($t_{1/2}$), `absorptionRateKa` ($k_a$), `saturableKinetics` (`vmax`, `km`), `twoCompartment` (`alpha`, `beta`, `k12`, `k21`), `therapeuticRange` (`min`, `max`, `unit`), `narrowTherapeuticIndex` (boolean), `renalRules`, `hepaticRules`, `majorInteractions`, `citations`.
2. **Simulation Case Document (`cases/{caseId}`)**:
   - `caseId`: UUID / synthetic code (e.g., `SYN-84920`)
   - `ownerUid`: Firebase User UID
   - `patientInputs`: Age, sex, weight, height, serum creatinine, potassium, Child-Pugh, CPIC genotype, comorbidities (strictly de-identified)
   - `derivedBiometrics`: BMI, IBW, AdjBW, BSA, CrCl, eGFR
   - `regimen`: Drug ID, dose, interval, route, infusion time
   - `pkOutputs`: $k_e$, $t_{1/2}$, $CL$, $V_d$, $C_{max,ss}$, $C_{min,ss}$, $C_{ss,avg}$, $AUC_\tau$, accumulation ratio, safety ceiling status
   - `triage`: Score, risk tier (Low/Moderate/High/Critical), factor breakdown, monitoring protocol
   - `engineVersion`: e.g., `"2.4.0-validated"`
   - `createdAt`: ISO 8601 timestamp

### Verification Plan
- Run automated mathematical unit test suite:
  1. $500\text{ mg}$ IV bolus, $V_d = 20\text{ L}$, $CL = 5\text{ L/h} \implies k_e = 0.25\text{ h}^{-1}$, $t_{1/2} \approx 2.77\text{ h}$, $C_0 = 25\text{ mg/L}$.
  2. Male, 60 y, $70\text{ kg}$, $\text{SCr } 1.0\text{ mg/dL} \implies \text{Cockcroft-Gault } CrCl \approx 77.8\text{ mL/min}$.
  3. Steady-state accumulation ratio and loading dose checks.
  4. Phenytoin Michaelis-Menten non-linear clearance curve check.
- Run `npm run lint` and `npm run build` to confirm clean compilation.
- Verify security rules in `firestore.rules` denying unauthorized cross-user reads.
