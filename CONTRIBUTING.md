# Contributing to SYNTHOS

Thank you for your interest in contributing to **SYNTHOS** — Clinical Decision Support Matrix & Pharmacokinetic Digital Twin.

SYNTHOS is committed to open, transparent, and reproducible clinical pharmacology tools. We welcome contributions from software engineers, clinical pharmacologists, nephrologists, pharmacists, and medical researchers.

---

## 1. Safety and Architectural Tenets

When contributing to SYNTHOS, adhere to these fundamental principles:

1. **Zero Hallucination Deterministic Math**: All pharmacokinetic calculations ($k_e$, $t_{1/2}$, $C_{ss}$, CrCl, eGFR, loading doses) must be implemented in deterministic TypeScript functions with accompanying automated unit tests.
2. **HIPAA Safe Harbor & Data Privacy**: Never commit real patient identifiers or Protected Health Information (PHI). Free-text fields must pass through the `detectAndSanitizePHI()` guardrail.
3. **Versioned Drug Knowledge**: Drug dosing rules, therapeutic ranges, and interaction mechanisms must be documented in `src/data/versionedDrugs.json` with appropriate citations (e.g., KDIGO, CPIC, FDA package inserts).

---

## 2. Development Workflow

### Prerequisites
- Node.js 20+ / 22+
- npm or bun

### Setup
```bash
# Clone the repository
git clone https://github.com/<your-username>/synthos.git
cd synthos

# Install dependencies
npm install

# Run the deterministic unit test suite
npm test

# Start the full-stack development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 3. Adding New Drugs to the Library

To add a new pharmaceutical agent:
1. Open `src/data/versionedDrugs.json`.
2. Add the compound following the strict schema:
   - `id`: Unique identifier (e.g., `amikacin`)
   - `name`: Generic drug name
   - `class`: Pharmacological category
   - `halfLifeHours`: Normal adult half-life
   - `clearanceLPerHr`: Mean clearance
   - `volumeOfDistributionL`: Volume of distribution
   - `therapeuticWindow`: Lower and upper therapeutic target (mcg/mL or mg/L)
   - `isNarrowTherapeuticIndex`: `true` or `false`
   - `renalAdjustmentRules`: Stage-specific dosage titration guidance
   - `citation`: Peer-reviewed reference

3. Add corresponding test cases in `src/utils/clinicalMath.ts` and verify with `npm test`.

---

## 4. Submitting a Pull Request

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/new-drug-guideline
   ```
2. Ensure all lint and tests pass:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
3. Commit with a descriptive commit message following Conventional Commits format (`feat:`, `fix:`, `docs:`, `test:`).
4. Push your branch and open a Pull Request.

---

## 5. Code of Conduct

We are dedicated to providing a welcoming, inclusive, and harassment-free experience for everyone. Respectful dialogue and evidence-based clinical discussions are expected at all times.
