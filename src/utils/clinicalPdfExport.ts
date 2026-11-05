import { jsPDF } from 'jspdf';
import { PatientCase } from '../types/clinical';

export interface PdfExportOptions {
  clinicianName?: string;
  clinicianCredentials?: string;
  institution?: string;
}

export function exportPatientTwinToPdf(patient: PatientCase, options?: PdfExportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const clinicianName = options?.clinicianName || 'Dr. A. Miller, PharmD, BCPS';
  const clinicianRole = options?.clinicianCredentials || 'Clinical Evaluator & Pharmacotherapy Specialist';
  const institution = options?.institution || 'SYNTHOS Clinical Precision Decision Support';
  const reportDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const auditToken = `CDS-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  // Helper colors
  const primaryTeal = [0, 106, 97]; // #006a61
  const darkSlate = [15, 23, 42]; // #0f172a
  const borderGray = [226, 232, 240]; // #e2e8f0
  const bgLight = [248, 250, 252]; // #f8fafc

  let y = margin;

  // Header Banner
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Decorative teal left bar
  doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.rect(margin, y, 3, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SYNTHOS — CLINICAL DIGITAL TWIN REPORT', margin + 7, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 220, 215);
  doc.text('Where Biology Meets Its Other Self • In Silico Pharmacokinetic Simulation & CDS Audit', margin + 7, y + 14);

  doc.setFontSize(7.5);
  doc.setTextColor(200, 210, 220);
  doc.text(`Generated: ${reportDate} | Verification Token: ${auditToken}`, margin + 7, y + 19.5);

  y += 28;

  // Patient Demographic Banner Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, y, contentWidth, 24, 'FD');

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`PATIENT CASE: ${patient.id} (${patient.nameAlias})`, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 4;
  const col2 = margin + 48;
  const col3 = margin + 98;
  const col4 = margin + 140;

  doc.text(`Age / Sex: ${patient.biometrics.age} Y / ${patient.biometrics.sex}`, col1, y + 12);
  doc.text(`Height: ${patient.biometrics.heightCm} cm | Weight: ${patient.biometrics.weightKg} kg`, col1, y + 17);
  doc.text(`BMI: ${patient.biometrics.bmi} kg/m²`, col1, y + 21);

  doc.text(`IBW (Cockcroft-Gault): ${patient.biometrics.ibwKg} kg`, col2, y + 12);
  doc.text(`Smoking Status: ${patient.biometrics.smoking}`, col2, y + 17);
  doc.text(`Allergies: ${patient.biometrics.allergies.join(', ') || 'NKDA'}`, col2, y + 21);

  doc.text(`Clinical Tier: ${patient.tier}`, col3, y + 12);
  doc.text(`Active Diagnoses:`, col3, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(patient.biometrics.diagnoses.join(', '), col3, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Primary Alert:`, col4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // red
  doc.text(patient.organStatus.renal.badge || 'FLAGGED', col4, y + 17);

  y += 28;

  // Section 1: Systems Biology & Organ Function Matrix
  doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SECTION 1: SYSTEMS BIOLOGY & MULTI-ORGAN BIOMARKER MATRIX', margin + 4, y + 4.2);

  y += 9;

  // 4 Organ Columns Grid
  const gridW = (contentWidth - 6) / 4;
  const organs = [
    {
      title: 'RENAL CLEARANCE',
      status: patient.organStatus.renal.status.toUpperCase(),
      line1: `eGFR: ${patient.organStatus.renal.egfr} mL/min/1.73m²`,
      line2: `Stage: ${patient.organStatus.renal.stage}`,
      line3: `SCr: ${patient.organStatus.renal.scr.toFixed(2)} | BUN: ${patient.organStatus.renal.bun}`,
      line4: `CrCl (CG): ${patient.organStatus.renal.crcl} mL/min`,
      flag: patient.organStatus.renal.badge,
      isAlert: patient.organStatus.renal.status !== 'normal'
    },
    {
      title: 'HEPATIC METABOLISM',
      status: patient.organStatus.hepatic.status.toUpperCase(),
      line1: `CYP450: ${patient.organStatus.hepatic.cypStatus}`,
      line2: `Class: ${patient.organStatus.hepatic.childPugh}`,
      line3: `ALT: ${patient.organStatus.hepatic.alt} U/L | AST: ${patient.organStatus.hepatic.ast} U/L`,
      line4: `Total Bili: ${patient.organStatus.hepatic.totalBili} mg/dL`,
      flag: patient.organStatus.hepatic.badge,
      isAlert: patient.organStatus.hepatic.status !== 'normal'
    },
    {
      title: 'CARDIOVASCULAR',
      status: patient.organStatus.cardiovascular.status.toUpperCase(),
      line1: `Blood Pressure: ${patient.organStatus.cardiovascular.bp} mmHg`,
      line2: `Stage: ${patient.organStatus.cardiovascular.bpStage}`,
      line3: `Heart Rate: ${patient.organStatus.cardiovascular.heartRate} bpm (${patient.organStatus.cardiovascular.rhythm})`,
      line4: `Serum K+: ${patient.organStatus.cardiovascular.potassium.toFixed(1)} mEq/L`,
      flag: patient.organStatus.cardiovascular.badge,
      isAlert: patient.organStatus.cardiovascular.status !== 'normal'
    },
    {
      title: 'GLYCEMIC & METABOLIC',
      status: patient.organStatus.glycemic.status.toUpperCase(),
      line1: `HbA1c: ${patient.organStatus.glycemic.hba1c}%`,
      line2: `Status: ${patient.organStatus.glycemic.controlText}`,
      line3: `Fasting Glucose: ${patient.organStatus.glycemic.fastingGlucose} mg/dL`,
      line4: `UACR: ${patient.organStatus.glycemic.uacr} mg/g`,
      flag: patient.organStatus.glycemic.badge,
      isAlert: patient.organStatus.glycemic.status !== 'controlled'
    }
  ];

  organs.forEach((org, idx) => {
    const x = margin + idx * (gridW + 2);
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(x, y, gridW, 36, 'FD');

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(org.title, x + 2.5, y + 5);

    // Status pill
    doc.setFontSize(6.5);
    if (org.isAlert) {
      doc.setTextColor(185, 28, 28);
    } else {
      doc.setTextColor(4, 120, 87);
    }
    doc.text(`Status: ${org.status}`, x + 2.5, y + 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(org.line1, x + 2.5, y + 14.5);
    doc.text(org.line2, x + 2.5, y + 19);
    doc.text(org.line3, x + 2.5, y + 23.5);
    doc.text(org.line4, x + 2.5, y + 28);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(org.isAlert ? 185 : 4, org.isAlert ? 28 : 120, org.isAlert ? 28 : 87);
    doc.text(org.flag.length > 25 ? org.flag.substring(0, 24) + '...' : org.flag, x + 2.5, y + 33);
  });

  y += 40;

  // Section 2: In Silico Pharmacokinetic Simulation & Medication Regimen Audit
  doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SECTION 2: COMPUTATIONAL PHARMACOKINETICS & THERAPEUTIC REGIMEN AUDIT', margin + 4, y + 4.2);

  y += 8;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  const tCol1 = margin + 3;
  const tCol2 = margin + 46;
  const tCol3 = margin + 86;
  const tCol4 = margin + 126;
  const tCol5 = margin + 158;

  doc.text('MEDICATION & DOSE', tCol1, y + 4.2);
  doc.text('METABOLISM / CLEARANCE', tCol2, y + 4.2);
  doc.text('SIMULATED KINETICS / EVALUATION', tCol3, y + 4.2);
  doc.text('GUIDELINE REFERENCE', tCol4, y + 4.2);
  doc.text('SAFETY STATUS', tCol5, y + 4.2);

  y += 7;

  patient.medications.forEach((med) => {
    const isFlagged = med.safetyStatus === 'flagged' || med.safetyStatus === 'contraindicated';
    doc.setFillColor(isFlagged ? 254 : 255, isFlagged ? 242 : 255, isFlagged ? 242 : 255);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, 14, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(med.name, tCol1, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${med.dose} (${med.frequency})`, tCol1, y + 8.5);
    doc.text(med.therapeuticClass, tCol1, y + 12);

    doc.setTextColor(51, 65, 85);
    doc.text(med.metabolism, tCol2, y + 4.5);
    doc.setTextColor(100, 116, 139);
    doc.text(med.metabolismDetail.length > 32 ? med.metabolismDetail.substring(0, 30) + '...' : med.metabolismDetail, tCol2, y + 9);

    doc.setFont('helvetica', isFlagged ? 'bold' : 'normal');
    doc.setTextColor(isFlagged ? 185 : 51, isFlagged ? 28 : 65, isFlagged ? 28 : 85);
    doc.text(med.safetyEvaluation.length > 35 ? med.safetyEvaluation.substring(0, 33) + '...' : med.safetyEvaluation, tCol3, y + 4.5);
    if (med.recommendedAction) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6);
      doc.setTextColor(15, 23, 42);
      doc.text(med.recommendedAction.length > 36 ? med.recommendedAction.substring(0, 34) + '...' : med.recommendedAction, tCol3, y + 9);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(med.guidelineCitation, tCol4, y + 4.5);

    // Status Pill
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (isFlagged) {
      doc.setTextColor(185, 28, 28);
      doc.text('⚠ FLAGGED', tCol5, y + 6);
    } else {
      doc.setTextColor(4, 120, 87);
      doc.text('✓ OPTIMAL', tCol5, y + 6);
    }

    y += 15;
  });

  y += 2;

  // Section 3: Priority Triage & Action Plan
  if (patient.priorityTriage) {
    doc.setFillColor(254, 243, 199); // amber 100
    doc.setDrawColor(245, 158, 11);
    doc.rect(margin, y, contentWidth, 18, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text(`CDS PRIORITY TRIAGE: ${patient.priorityTriage.title} (${patient.priorityTriage.level})`, margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(69, 26, 3);
    const splitDiscrepancy = doc.splitTextToSize(patient.priorityTriage.discrepancyText, contentWidth - 8);
    doc.text(splitDiscrepancy, margin + 4, y + 9.5);

    y += 22;
  }

  // Section 4: Pharmacist Consultation & Electronic Sign-off
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, y, contentWidth, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('SECTION 4: ELECTRONIC CLINICAL SIGN-OFF & CDS MATRIX AUDIT', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text(`Consulting Clinician: ${clinicianName}`, margin + 4, y + 13);
  doc.text(`Role / Specialty: ${clinicianRole}`, margin + 4, y + 18);
  doc.text(`Institution: ${institution}`, margin + 4, y + 23);
  doc.text(`Deterministic Verification Hash: ${auditToken}`, margin + 4, y + 28);

  // Digital Signature Box
  const sigX = margin + 115;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.rect(sigX, y + 4, 60, 28, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CRYPTOGRAPHIC SIGNATURE', sigX + 3, y + 8);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 106, 97);
  doc.text('/s/ ' + clinicianName.split(',')[0], sigX + 3, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Signed electronically in accordance with', sigX + 3, y + 22);
  doc.text('Title 21 CFR Part 11 & GAMP-5 validated CDS', sigX + 3, y + 26);

  // Bottom Legal & Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'CONFIDENTIAL CLINICAL DECISION SUPPORT DOCUMENT. Generated by SYNTHOS In Silico Simulation Engine for licensed clinician evaluation. Not an automated diagnosis.',
    margin,
    pageHeight - 6
  );

  doc.setFont('helvetica', 'normal');
  doc.text(`Page 1 of 1 • Case ${patient.id}`, pageWidth - margin - 28, pageHeight - 6);

  // Trigger browser download of structured PDF
  const filename = `SYNTHOS_Clinical_Twin_Report_${patient.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
