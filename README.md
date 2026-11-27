# Synthos pharmacology learning lab

Explore how a simulated patient’s characteristics affect modelled drug exposure. Clinicians and supervised learners can work through a fictional case, look up a medicine, and inspect the evidence behind the model. Use synthetic data for practice.

## Try a guided case

[Open this repository in GitHub Codespaces](https://codespaces.new/sivabindya2005-cell/Synthos). Create a workspace on the branch you want to try. Once setup finishes, run the following in its terminal.

```sh
npm run dev
```

Open **Synthos** on port **3000** in the Ports panel. Acknowledge the educational terms, then choose **Start a guided case**. Keep the sample inputs on your first visit and advance through patient characteristics, regimen, and model results. Account sign-in and an AI key are optional for this exercise.

## Run on your computer

With Node.js 22.12+ and Bun installed, run the following commands.

```sh
git clone https://github.com/sivabindya2005-cell/Synthos.git
cd Synthos
bun install --frozen-lockfile
npm run dev
```

Open [Synthos locally](http://localhost:3000). Bookmark a tool or share its URL with someone using the same installation. The URL identifies the tool and excludes your patient inputs.

| Start here | What you can do |
| --- | --- |
| [Guided case](http://localhost:3000/?view=guided-wizard) | Work through a fictional pharmacokinetic simulation. |
| [Drug library](http://localhost:3000/?view=drug-explorer) | Explore drug targets and model inputs. |
| [Evidence library](http://localhost:3000/?view=evidence-library) | Review source material and provenance. |

Run `npm test` for the deterministic calculation suite and `npm run build` to build the frontend.

---

## Google sign-in and cloud cases

Choose **Clinician sign in → Continue with Google**, then open **My cases** to save a synthetic case to your account. The named Firestore database and its indexes are configured in `firebase.json`. Google sign-in requires the app hostname in Firebase Authentication’s authorized domains. Use the hosted app for Google sign-in until your local preview hostname has been authorized.

For a local integration check, install the Firebase CLI and Java 21+, then run the following from the checkout. The test uses a fictional Google identity and the loopback emulators.

```sh
firebase emulators:exec --only auth,firestore --project demo-synthos "node tests/firebase-account.mjs"
```

To try the emulated sign-in flow in the browser, run the same emulators with `emulators:start` and start the development server with `VITE_FIREBASE_EMULATORS=true` and an explicit `--port`. For production, a project administrator can deploy the checked-in rules and indexes with `firebase deploy --only firestore --project mythic-pottery-w9brs`. Review any CLI prompt about existing indexes before proceeding.
## Team handoffs and saved results

Open **Care handoff** for a fictional four-role exercise. The pharmacist drafts instructions, the physician reviews them, the nurse records follow-up, and the patient describes their understanding or asks a question. The physician replies to close the handoff. Practice records last for the current view.

In **My assigned cases**, each participant signs in separately. A project administrator assigns the Firebase custom claim `careRole` to staff using the values `pharmacist`, `physician`, or `nurse`. Preserve existing claims when provisioning. Staff refresh their sign-in after a role change. The pharmacist enters each participant’s assignment ID. The nurse receives access after physician approval, and the patient after nursing acknowledgement. The patient uses their ordinary signed-in account.

Opening a saved simulation displays its recorded inputs and outputs. Earlier records carry a legacy label. The digital twin workstation supports metformin; the guided wizard exposes the full catalog of implemented drug models.

Account deletion requires a recent sign-in. A durable request marker prevents new personal records during cleanup. Retrying finishes the remaining steps. Private cases, submitted feedback, the profile and login are deleted. Shared training handoffs, append-only audit entries and the request marker remain. Set an institutional retention policy before using connected workflows in a hospital.
## 1. Regulatory Positioning & Product Scope
- **Educational Decision Support**: SYNTHOS provides educational decision support under 21 U.S.C. § 360j(o)(1)(E). It does not replace individualized clinical judgment and is not a certified medical device.
- **De-Identified / Safe Harbor**: The platform defaults to synthetic patient cases and enforces a persistent banner: *"Use synthetic or de-identified data only. Do not enter names, phone numbers, addresses or hospital IDs."*
- **Real-Time PHI Scanner**: Active client-side and server-side regular expressions scan all free-text fields and automatically strip email addresses, phone numbers, national IDs, and medical record numbers (MRNs).

---

## 2. Deterministic Pharmacokinetic Engine
All numerical outputs are strictly computed by deterministic TypeScript mathematical algorithms. The AI model is strictly prohibited from inventing, guessing, or modifying numbers.

### Core Pharmacokinetic Formulas
- **Elimination Rate Constant**: $k_e = \frac{CL}{V_d}$
- **Half-Life**: $t_{1/2} = \frac{\ln(2)}{k_e}$
- **One-Compartment IV Bolus**: $C(t) = \frac{\text{Dose}}{V_d} e^{-k_e t}, \quad C_0 = \frac{\text{Dose}}{V_d}$
- **One-Compartment IV Infusion**:
  $$C(t) = \frac{R_{inf}}{CL} (1 - e^{-k_e t_{inf}}) e^{-k_e (t - t_{inf})}$$
- **First-Order Oral Absorption**:
  $$C(t) = \frac{F \times \text{Dose} \times k_a}{V_d (k_a - k_e)} (e^{-k_e t} - e^{-k_a t})$$
- **Multiple Dosing Accumulation Factor**: $R = \frac{1}{1 - e^{-k_e \tau}}$
- **Average Steady-State Concentration**: $C_{ss,avg} = \frac{F \times \text{Dose}}{CL \times \tau}$
- **Loading Dose**: $\text{Loading Dose} = \frac{C_{ss,target} \times V_d}{F}$
- **Michaelis-Menten Saturable Elimination (Phenytoin)**:
  $$C_{ss} = \frac{K_m \times \text{DailyDose}}{V_{max} - \text{DailyDose}}$$

### Derived Clearance Equations
- **Ideal Body Weight (Devine 1974)**:
  - Male: $50.0\text{ kg} + 2.3 \times (\text{Height in inches} - 60)$
  - Female: $45.5\text{ kg} + 2.3 \times (\text{Height in inches} - 60)$
- **Adjusted Body Weight (AdjBW)**:
  - $\text{AdjBW} = \text{IBW} + 0.4 \times (\text{Actual Body Weight} - \text{IBW})$
- **Cockcroft-Gault Creatinine Clearance (CrCl)**:
  $$\text{CrCl} = \frac{(140 - \text{Age}) \times \text{WeightUsed}}{72 \times \text{SCr}} \times (0.85 \text{ if Female})$$
- **2021 Race-Free CKD-EPI eGFR (Inker et al. NEJM 2021)**:
  $$\text{eGFR} = 142 \times \min(\text{SCr}/\kappa, 1)^\alpha \times \max(\text{SCr}/\kappa, 1)^{-1.200} \times 0.9938^{\text{Age}} \times [1.012 \text{ if Female}]$$

---

## 3. Automated Mathematical Unit Test Suite
The app includes a built-in automated test suite executable with one click in the UI via the **Unit Tests** button:
1. **IV Bolus Test**: 500 mg IV bolus, $V_d = 20\text{ L}$, $CL = 5\text{ L/h} \implies k_e = 0.25\text{ h}^{-1}$, $t_{1/2} = 2.77\text{ h}$, $C_0 = 25.0\text{ mg/L}$.
2. **Cockcroft-Gault Baseline Test**: Male, 60 years, 70 kg, SCr 1.0 mg/dL $\implies \text{CrCl} \approx 77.8\text{ mL/min}$.
3. **Accumulation Factor Test**: $\tau = 12\text{ h}$, $k_e = 0.1\text{ h}^{-1} \implies R \approx 1.43$.
4. **Loading Dose Test**: Target $C_{ss} = 15\text{ mcg/mL}$, $V_d = 35\text{ L}$, $F = 1.0 \implies \text{Loading Dose} = 525\text{ mg}$.
5. **2021 CKD-EPI Race-Free Test**: Female, 65y, SCr 1.4 mg/dL $\implies \text{eGFR} \approx 43\text{ mL/min/1.73m}^2$ (Stage G3b).
6. **HIPAA Safe Harbor PHI Test**: Detects and redacts emails, phone numbers, and MRN patterns from patient text.

---

## 4. Firebase Authentication & Firestore Security Rules
- **Active Project ID**: `mythic-pottery-w9brs`
- **Firestore Database ID**: `ai-studio-synthos-2abc6e46-56c3-4437-a415-89461a1945e0`
- **Security Policy**:
  - `cases`: Strict user UID isolation. Users read and write only their own simulation documents.
  - `drugs`: Public read; write-restricted strictly to administrator (`sivasyam05@gmail.com`).
  - `auditLogs`: Strictly append-only. Modification and deletion are disabled (`allow update, delete: if false`).

---

## 5. Pre-Launch Verification Checklist
- [x] **Calculation Correctness**: All 6 deterministic unit tests pass with exact numerical matches.
- [x] **Zero AI Hallucination**: AI is called only via `/api/clinical-explain` to interpret pre-calculated values using strict JSON schema.
- [x] **Security Hardening**: No API keys in client-side bundles; express rate limiting (80 req/min/IP) and AI daily quota (120 calls/day/IP).
- [x] **Data Governance & DPDP Act 2023**: "Export My Data" (JSON) and "Delete Account & Data" live in Clinical Scope view.
- [x] **Pastel Design System**: Calibrated tokens (`#FBF9FF`, `#CDB4DB`, `#7C6BC4`, `#B5EAD7`, `#FDF2B3`, `#FFDAC1`, `#F4A6B8`).
- [x] **WCAG AA Compliance**: High contrast ratios, non-hue-only risk indicators, visible focus rings, and prefers-reduced-motion support.
- [x] **Multi-Device Responsiveness**: Tested and functional on mobile drawers, tablets, and 1440px desktop workstations.
