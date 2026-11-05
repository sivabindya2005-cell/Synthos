import React, { useState } from 'react';
import { PatientCase } from '../../types/clinical';
import { PATIENT_CASES } from '../../data/patientCases';

interface OverviewViewProps {
  patient: PatientCase;
  onSelectPatient: (patientId: string) => void;
  onOpenRenalMath: () => void;
  onOpenSimulator: () => void;
  onOpenNewAssessment: () => void;
  onNavigateTab: (tabId: string) => void;
  onOpenProvenance?: (provenanceId: string) => void;
  onExportPdf?: () => void;
  onOpenPersonalizeRegimen?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  patient,
  onSelectPatient,
  onOpenRenalMath,
  onOpenSimulator,
  onOpenNewAssessment,
  onNavigateTab,
  onOpenProvenance,
  onExportPdf,
  onOpenPersonalizeRegimen
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRxOption, setSelectedRxOption] = useState<string>(
    patient.priorityTriage.defaultSelectedOption
  );
  const [pharmacistNote, setPharmacistNote] = useState<string>(
    patient.priorityTriage.defaultNote
  );
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showDoseReductionCurve, setShowDoseReductionCurve] = useState<boolean>(false);

  // Drag-and-drop workspace layout state
  const STORAGE_KEY = 'synthos_workspace_widget_layout_v2';
  const DEFAULT_LEFT_WIDGETS = ['organ-profile', 'medication-review', 'rules-trace'];
  const DEFAULT_RIGHT_WIDGETS = ['priority-triage', 'biometrics', 'recent-scenarios'];

  const [colLeft, setColLeft] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.colLeft) && parsed.colLeft.length > 0) {
          return parsed.colLeft;
        }
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_LEFT_WIDGETS;
  });

  const [colRight, setColRight] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.colRight)) {
          return parsed.colRight;
        }
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_RIGHT_WIDGETS;
  });

  const [layoutMode, setLayoutMode] = useState<'asymmetric' | 'balanced' | 'inverted'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.layoutMode) return parsed.layoutMode;
      }
    } catch {
      // Fallback
    }
    return 'asymmetric';
  });

  const [collapsedWidgets, setCollapsedWidgets] = useState<Record<string, boolean>>({});
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<'left' | 'right' | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const saveLayout = (left: string[], right: string[], mode: 'asymmetric' | 'balanced' | 'inverted') => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          colLeft: left,
          colRight: right,
          layoutMode: mode
        })
      );
    } catch (e) {
      console.error('Failed to save layout:', e);
    }
  };

  const moveWidgetWithinCol = (column: 'left' | 'right', fromIndex: number, toIndex: number) => {
    if (column === 'left') {
      if (toIndex < 0 || toIndex >= colLeft.length) return;
      const updated = [...colLeft];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      setColLeft(updated);
      saveLayout(updated, colRight, layoutMode);
    } else {
      if (toIndex < 0 || toIndex >= colRight.length) return;
      const updated = [...colRight];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      setColRight(updated);
      saveLayout(colLeft, updated, layoutMode);
    }
  };

  const moveWidgetToOtherCol = (widgetId: string, currentColumn: 'left' | 'right') => {
    if (currentColumn === 'left') {
      const newLeft = colLeft.filter((id) => id !== widgetId);
      const newRight = [widgetId, ...colRight];
      setColLeft(newLeft);
      setColRight(newRight);
      saveLayout(newLeft, newRight, layoutMode);
    } else {
      const newRight = colRight.filter((id) => id !== widgetId);
      const newLeft = [widgetId, ...colLeft];
      setColLeft(newLeft);
      setColRight(newRight);
      saveLayout(newLeft, newRight, layoutMode);
    }
  };

  const toggleCollapse = (widgetId: string) => {
    setCollapsedWidgets((prev) => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

  const handleResetLayout = () => {
    setColLeft(DEFAULT_LEFT_WIDGETS);
    setColRight(DEFAULT_RIGHT_WIDGETS);
    setLayoutMode('asymmetric');
    setCollapsedWidgets({});
    saveLayout(DEFAULT_LEFT_WIDGETS, DEFAULT_RIGHT_WIDGETS, 'asymmetric');
    setToastMessage('Workspace layout reset to default template');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3200);
  };

  const handleDragStart = (
    e: React.DragEvent,
    widgetId: string,
    sourceCol: 'left' | 'right',
    sourceIndex: number
  ) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ widgetId, sourceCol, sourceIndex }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedWidgetId(widgetId);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverCol(null);
    setDragOverIndex(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, col: 'left' | 'right') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== col) {
      setDragOverCol(col);
    }
  };

  const handleDragOverItem = (e: React.DragEvent, col: 'left' | 'right', index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(col);
    setDragOverIndex(index);
  };

  const handleDropOnItem = (e: React.DragEvent, targetCol: 'left' | 'right', targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { widgetId, sourceCol } = JSON.parse(dataStr);
      if (!widgetId) return;

      let newLeft = [...colLeft];
      let newRight = [...colRight];

      // Remove from source column
      if (sourceCol === 'left') {
        newLeft = newLeft.filter((id) => id !== widgetId);
      } else {
        newRight = newRight.filter((id) => id !== widgetId);
      }

      // Insert at target index
      if (targetCol === 'left') {
        newLeft.splice(targetIndex, 0, widgetId);
      } else {
        newRight.splice(targetIndex, 0, widgetId);
      }

      setColLeft(newLeft);
      setColRight(newRight);
      saveLayout(newLeft, newRight, layoutMode);
    } catch (err) {
      console.error('Drop error:', err);
    } finally {
      setDraggedWidgetId(null);
      setDragOverCol(null);
      setDragOverIndex(null);
    }
  };

  const handleDropOnColumnEnd = (e: React.DragEvent, targetCol: 'left' | 'right') => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { widgetId, sourceCol } = JSON.parse(dataStr);
      if (!widgetId) return;

      let newLeft = [...colLeft];
      let newRight = [...colRight];

      if (sourceCol === 'left') {
        newLeft = newLeft.filter((id) => id !== widgetId);
      } else {
        newRight = newRight.filter((id) => id !== widgetId);
      }

      if (targetCol === 'left') {
        newLeft.push(widgetId);
      } else {
        newRight.push(widgetId);
      }

      setColLeft(newLeft);
      setColRight(newRight);
      saveLayout(newLeft, newRight, layoutMode);
    } catch (err) {
      console.error('Drop on column end error:', err);
    } finally {
      setDraggedWidgetId(null);
      setDragOverCol(null);
      setDragOverIndex(null);
    }
  };

  const handleAcknowledge = () => {
    setIsAcknowledged(!isAcknowledged);
    setToastMessage(
      !isAcknowledged
        ? 'Intervention acknowledged & logged to Synthetic Audit Trail'
        : 'Intervention returned to pending review'
    );
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3800);
  };

  const handleSaveNote = () => {
    setToastMessage('Pharmacist Clinical Note Saved to Synthetic EHR Record');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3800);
  };

  const { organStatus, biometrics, priorityTriage } = patient;

  const WIDGET_CONFIG: Record<
    string,
    { title: string; shortLabel: string; icon: string; category: string }
  > = {
    'organ-profile': {
      title: 'Synthetic Patient Digital Profile & Organ Status Map',
      shortLabel: 'Organ Twin & PK',
      icon: 'hub',
      category: 'Biometrics & Clearance'
    },
    'medication-review': {
      title: 'Active Medication Review & Guideline Synthesis',
      shortLabel: 'Medication Review',
      icon: 'medication',
      category: 'Pharmacotherapy'
    },
    'rules-trace': {
      title: 'Automated PGx & PK Rule Verification Trace',
      shortLabel: 'Rule Verification',
      icon: 'menu_book',
      category: 'Clinical Decision Support'
    },
    'priority-triage': {
      title: 'Pharmacist Priority Queue & Clinical Intervention',
      shortLabel: 'Priority Triage',
      icon: 'crisis_alert',
      category: 'Action Alert'
    },
    'biometrics': {
      title: 'Patient Biometric Twin Status',
      shortLabel: 'Biometrics Status',
      icon: 'person',
      category: 'Patient Context'
    },
    'recent-scenarios': {
      title: 'Recent Synthetic Scenarios',
      shortLabel: 'Cohort Scenarios',
      icon: 'folder_shared',
      category: 'Patient Cases'
    }
  };

  const renderOrganProfileWidget = () => (
    <section className="bg-white rounded-xl shadow-2xs border border-[#e2e8f0] overflow-hidden">
      <div className="p-3 bg-[#f2f4f6] flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006a61] text-[22px]">hub</span>
          <div>
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#191c1e]">
              Synthetic Patient Digital Profile &amp; Organ Status Map
            </h2>
            <p className="text-[11px] text-[#475569]">
              Biometric organ nodes synthesized from baseline EHR lab feeds
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[#475569] text-[11px] font-semibold">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              organStatus.renal.status === 'compromised' ? 'bg-[#92400e]' : 'bg-[#006a61]'
            }`}
          ></span>
          <span>
            {organStatus.renal.status === 'compromised'
              ? '1 Organ Compromise Flagged'
              : 'Organ Clearance Balanced'}
          </span>
        </div>
      </div>

      <div className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Renal Node */}
          <div
            className={`relative rounded-xl p-3 flex flex-col justify-between border ${
              organStatus.renal.status === 'compromised'
                ? 'bg-[#fef3c7]/30 border-[#fde68a]'
                : 'bg-[#f2f4f6] border-[#e2e8f0]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#92400e] uppercase tracking-wider">
                Renal Function
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  organStatus.renal.status === 'compromised'
                    ? 'bg-[#92400e] animate-pulse'
                    : 'bg-[#006a61]'
                }`}
              ></span>
            </div>
            <div className="my-2">
              <div className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#92400e]">
                {organStatus.renal.egfr}{' '}
                <span className="text-xs font-normal text-[#92400e]">mL/min</span>
              </div>
              <div className="text-[11px] text-[#92400e] font-medium">
                eGFR ({organStatus.renal.egfrMethod})
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#475569]">SCr:</span>
                <span className="font-mono font-bold">{organStatus.renal.scr.toFixed(2)} mg/dL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">BUN:</span>
                <span className="font-mono">{organStatus.renal.bun} mg/dL</span>
              </div>
            </div>
            <button
              onClick={onOpenRenalMath}
              className="mt-2 py-1 px-2 rounded bg-[#fef3c7] text-[#92400e] hover:bg-[#fde68a] text-[10px] uppercase tracking-tight text-center font-bold transition-colors cursor-pointer"
            >
              {organStatus.renal.badge}
            </button>
          </div>

          {/* Hepatic Node */}
          <div className="bg-[#f2f4f6] rounded-xl p-3 flex flex-col justify-between border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#006a61] uppercase tracking-wider">
                Hepatic Function
              </span>
              <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
            </div>
            <div className="my-2">
              <div className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#191c1e]">
                Normal{' '}
                <span className="text-xs text-[#006a61] font-normal block">
                  {organStatus.hepatic.cypStatus}
                </span>
              </div>
              <div className="text-[11px] text-[#475569]">{organStatus.hepatic.childPugh}</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#475569]">ALT / AST:</span>
                <span className="font-mono">
                  {organStatus.hepatic.alt} / {organStatus.hepatic.ast} U/L
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Total Bili:</span>
                <span className="font-mono">{organStatus.hepatic.totalBili} mg/dL</span>
              </div>
            </div>
            <div className="mt-2 py-1 px-2 rounded bg-[#d1fae5] text-[#065f46] text-[10px] uppercase tracking-tight text-center font-bold">
              {organStatus.hepatic.badge}
            </div>
          </div>

          {/* Cardiovascular Node */}
          <div className="bg-[#f2f4f6] rounded-xl p-3 flex flex-col justify-between border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#92400e] uppercase tracking-wider">
                Cardiovascular
              </span>
              <span className="w-2 h-2 rounded-full bg-[#92400e]"></span>
            </div>
            <div className="my-2">
              <div className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#191c1e]">
                {organStatus.cardiovascular.bp}{' '}
                <span className="text-xs text-[#475569] font-normal">mmHg</span>
              </div>
              <div className="text-[11px] text-[#475569]">{organStatus.cardiovascular.bpStage}</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#475569]">Heart Rate:</span>
                <span className="font-mono">
                  {organStatus.cardiovascular.heartRate} bpm {organStatus.cardiovascular.rhythm}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">K+ Serum:</span>
                <span className="font-mono font-bold text-[#92400e]">
                  {organStatus.cardiovascular.potassium.toFixed(1)} mEq/L
                </span>
              </div>
            </div>
            <div className="mt-2 py-1 px-2 rounded bg-[#e6e8ea] text-[#475569] text-[10px] uppercase tracking-tight text-center font-bold">
              {organStatus.cardiovascular.badge}
            </div>
          </div>

          {/* Glycemic Control Node */}
          <div className="bg-[#f2f4f6] rounded-xl p-3 flex flex-col justify-between border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#92400e] uppercase tracking-wider">
                Glycemic Control
              </span>
              <span className="w-2 h-2 rounded-full bg-[#92400e]"></span>
            </div>
            <div className="my-2">
              <div className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#191c1e]">
                {organStatus.glycemic.hba1c}%{' '}
                <span className="text-xs text-[#475569] font-normal">HbA1c</span>
              </div>
              <div className="text-[11px] text-[#475569]">{organStatus.glycemic.controlText}</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#475569]">Fasting Glucose:</span>
                <span className="font-mono">{organStatus.glycemic.fastingGlucose} mg/dL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">UACR:</span>
                <span className="font-mono">{organStatus.glycemic.uacr} mg/g</span>
              </div>
            </div>
            <div className="mt-2 py-1 px-2 rounded bg-[#fef3c7] text-[#92400e] text-[10px] uppercase tracking-tight text-center font-bold">
              {organStatus.glycemic.badge}
            </div>
          </div>
        </div>

        {/* Pharmacokinetic Simulation Curve: Metformin Accumulation Risk */}
        <div className="bg-[#f2f4f6] rounded-xl p-3 border border-[#e2e8f0]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#006a61]">
                show_chart
              </span>
              <span className="text-xs font-bold text-[#191c1e]">
                Simulated Metformin Plasma Steady-State Concentration (Css)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDoseReductionCurve(!showDoseReductionCurve)}
                className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#006a61] font-semibold transition-colors cursor-pointer"
              >
                {showDoseReductionCurve ? 'Hide 500mg Simulation' : 'Simulate 500mg BID'}
              </button>
              <span className="text-[10px] font-bold text-[#92400e] bg-[#fef3c7] px-2 py-0.5 rounded">
                Simulated Half-Life Extended: {patient.pkData.halfLifeBaseline} → {patient.pkData.halfLifeCurrent}
              </span>
            </div>
          </div>

          <div className="relative w-full h-36 bg-white rounded-lg p-2 border border-[#e2e8f0] overflow-hidden">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 680 120">
              <defs>
                <linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#92400e" stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor="#92400e" stopOpacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="normalFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#006a61" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="#006a61" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>

              <line stroke="#fecaca" strokeDasharray="4,4" strokeWidth="1.5" x1="0" x2="680" y1="35" y2="35"></line>
              <text className="text-[10px] font-bold" fill="#991b1b" x="5" y="28">
                Upper Safety Threshold (2.5 mcg/mL - Lactic Acidosis Risk Zone)
              </text>

              <line stroke="#cbd5e1" strokeDasharray="2,2" strokeWidth="1" x1="0" x2="680" y1="75" y2="75"></line>
              <text className="text-[10px]" fill="#475569" x="5" y="70">
                Target Steady-State Range (1.0 - 2.0 mcg/mL)
              </text>

              <path
                d="M 0,110 Q 70,50 140,80 T 280,75 T 420,78 T 560,76 T 680,75"
                fill="none"
                stroke="#006a61"
                strokeWidth="2"
              ></path>

              <path
                d="M 0,110 Q 60,15 130,42 T 260,32 T 400,28 T 540,26 T 680,24 L 680,120 L 0,120 Z"
                fill="url(#curveFill)"
              ></path>
              <path
                d="M 0,110 Q 60,15 130,42 T 260,32 T 400,28 T 540,26 T 680,24"
                fill="none"
                stroke="#92400e"
                strokeWidth="2.5"
              ></path>
              <circle cx="540" cy="26" fill="#92400e" r="4.5"></circle>

              {showDoseReductionCurve && (
                <>
                  <path
                    d="M 0,110 Q 60,55 130,70 T 260,65 T 400,62 T 540,60 T 680,60"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="2.5"
                    strokeDasharray="4,3"
                  ></path>
                  <circle cx="540" cy="60" fill="#14b8a6" r="4"></circle>
                  <text className="text-[10px] font-bold" fill="#006a61" x="380" y="55">
                    Predicted Peak on 500mg BID: 1.45 mcg/mL (Safe Range)
                  </text>
                </>
              )}
            </svg>

            <div className="absolute right-4 top-3 bg-white/95 backdrop-blur-xs rounded px-2.5 py-1 shadow-sm text-xs text-[#92400e] border border-[#fde68a]">
              Current Predicted Peak: <strong>{patient.pkData.predictedPeak}</strong> ({patient.pkData.pctVsReference})
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#475569] font-mono">
            <span>Dose Interval: 0h (Trough)</span>
            <span>12h Steady State</span>
            <span>24h Multiple Dose Simulation</span>
            <span>36h Model Prediction</span>
          </div>
        </div>
      </div>
    </section>
  );

  const renderMedicationReviewWidget = () => (
    <section className="bg-white rounded-xl shadow-2xs border border-[#e2e8f0] overflow-hidden">
      <div className="p-3 bg-[#f2f4f6] flex items-center justify-between border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006a61] text-[22px]">medication</span>
          <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#191c1e]">
            Active Medication Review &amp; Guideline Synthesis
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onOpenPersonalizeRegimen && (
            <button
              onClick={onOpenPersonalizeRegimen}
              className="px-2.5 py-1 rounded bg-[#006a61] text-white hover:bg-[#006f66] text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
              title="Personalize and titrate medications specifically for this patient"
            >
              <span className="material-symbols-outlined text-[15px]">tune</span>
              <span>Personalize Regimen</span>
            </button>
          )}
          <span className="text-[11px] bg-white border border-[#cbd5e1] px-2.5 py-0.5 rounded text-[#475569] font-bold">
            {patient.medications.length} Current Regimen Items
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f2f4f6] text-[#475569] text-[10px] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <th className="py-2.5 px-3">Drug Name &amp; Dose</th>
              <th className="py-2.5 px-3">Therapeutic Class</th>
              <th className="py-2.5 px-3">Metabolism &amp; Target</th>
              <th className="py-2.5 px-3">Safety Evaluation</th>
              <th className="py-2.5 px-3 text-right">Guideline Citation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eceef0]">
            {patient.medications.map((med) => {
              const isFlagged = med.safetyStatus === 'flagged';
              const isOptimal = med.safetyStatus === 'optimal';
              const isContra = med.safetyStatus === 'contraindicated';

              return (
                <tr
                  key={med.id}
                  className={`transition-colors ${
                    isFlagged
                      ? 'bg-[#fef3c7]/20 hover:bg-[#fef3c7]/30'
                      : isContra
                      ? 'bg-[#fee2e2]/25 hover:bg-[#fee2e2]/40'
                      : 'hover:bg-[#f2f4f6]'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-bold text-[#191c1e]">
                      <span>{med.name}</span>
                      {isFlagged && (
                        <span className="bg-[#fef3c7] text-[#92400e] text-[10px] px-1.5 py-0.2 rounded font-bold border border-[#fde68a]">
                          Flagged
                        </span>
                      )}
                      {isContra && (
                        <span className="bg-[#fee2e2] text-[#991b1b] text-[10px] px-1.5 py-0.2 rounded font-bold border border-[#fecaca]">
                          Contraindicated
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#475569] font-mono mt-0.5">
                      {med.dose} • {med.frequency}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-[#475569]">
                    {med.therapeuticClass}
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-[#191c1e] font-medium">{med.metabolism}</div>
                    <div className="text-[11px] text-[#92400e]">{med.metabolismDetail}</div>
                  </td>

                  <td className="py-3 px-3">
                    {isFlagged ? (
                      <span className="inline-flex items-center gap-1 text-[#92400e] text-[11px] bg-[#fef3c7] px-2 py-0.5 rounded font-bold border border-[#fde68a]">
                        <span className="material-symbols-outlined text-[14px]">report_problem</span>
                        {med.safetyEvaluation}
                      </span>
                    ) : isContra ? (
                      <span className="inline-flex items-center gap-1 text-[#991b1b] text-[11px] bg-[#fee2e2] px-2 py-0.5 rounded font-bold border border-[#fecaca]">
                        <span className="material-symbols-outlined text-[14px]">dangerous</span>
                        {med.safetyEvaluation}
                      </span>
                    ) : isOptimal ? (
                      <span className="inline-flex items-center gap-1 text-[#065f46] text-[11px] bg-[#d1fae5] px-2 py-0.5 rounded font-bold border border-[#a7f3d0]">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        {med.safetyEvaluation}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#191c1e] text-[11px] bg-[#eceef0] px-2 py-0.5 rounded font-medium">
                        <span className="material-symbols-outlined text-[14px] text-[#14b8a6]">check_circle</span>
                        {med.safetyEvaluation}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        if (onOpenProvenance && med.provenanceId) {
                          onOpenProvenance(med.provenanceId);
                        } else {
                          onNavigateTab('evidence-library');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs text-[#006a61] hover:underline font-medium cursor-pointer"
                      title={`Inspect verified provenance for ${med.name}`}
                    >
                      <span>{med.guidelineCitation}</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {med.provenanceId ? 'verified' : 'open_in_new'}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Calculated Cockcroft-Gault Bar */}
      <div className="p-2.5 bg-[#f2f4f6] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between text-[#475569] text-xs">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">info</span>
          Calculated Cockcroft-Gault CrCl: {patient.organStatus.renal.crcl} mL/min (IBW {biometrics.ibwKg}kg, Age {biometrics.age}, SCr {patient.organStatus.renal.scr.toFixed(2)})
        </span>
        <button
          onClick={onOpenRenalMath}
          className="text-[#006a61] font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Detailed Renal Clearance Math</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </button>
      </div>
    </section>
  );

  const renderRulesTraceWidget = () => (
    <section className="bg-white rounded-xl p-3 shadow-2xs border border-[#e2e8f0]">
      <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#191c1e] mb-2.5 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[#006a61] text-[20px]">menu_book</span>
        Automated Pharmacogenomic &amp; Pharmacokinetic Rule Verification Trace
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {patient.rulesTriggered.map((rule) => (
          <div key={rule.id} className="bg-[#f2f4f6] rounded-lg p-3 border border-[#e2e8f0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#92400e] text-[11px] truncate">
                  {rule.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fef3c7] text-[#92400e] font-semibold">
                  {rule.ruleCode}
                </span>
              </div>
              <p className="text-[#44474d] text-xs leading-relaxed mb-2">
                {rule.text}
              </p>
            </div>
            {onOpenProvenance && (
              <button
                onClick={() =>
                  onOpenProvenance(
                    rule.provenanceId || (rule.id === 'rule-1' ? 'prov-met-renal' : 'prov-sglt2-kdigo')
                  )
                }
                className="self-start text-[11px] font-semibold text-[#006a61] hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>Audit Regulatory Provenance &amp; PubMed DOI</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  const renderPriorityTriageWidget = () => (
    <section className="bg-white rounded-xl shadow-md border border-[#fde68a] overflow-hidden">
      <div className="bg-[#fef3c7] p-3 flex items-center justify-between border-b border-[#fde68a]">
        <div className="flex items-center gap-1.5 text-[#92400e]">
          <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
          <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm">Priority Triage Item</span>
        </div>
        <span className="text-[10px] bg-[#92400e] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          {priorityTriage.level}
        </span>
      </div>

      <div className="p-3.5 flex flex-col gap-3">
        <div>
          <div className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#191c1e]">
            {priorityTriage.title}
          </div>
          <div className="text-xs text-[#475569] mt-0.5 font-medium">
            Current Dose: <strong>{priorityTriage.currentDoseSummary}</strong>
          </div>
        </div>

        <div className="bg-[#fef3c7]/30 rounded-lg p-2.5 space-y-1 text-[#92400e] text-xs border border-[#fde68a]/50">
          <div className="font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Guideline Discrepancy Detected
          </div>
          <p className="leading-relaxed">
            {priorityTriage.discrepancyText}
          </p>
        </div>

        {/* Clinical Twin Recommended Interventions */}
        <div>
          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
            Twin Prescribing Recommendations
          </span>
          <div className="space-y-1.5">
            {priorityTriage.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-start gap-2.5 p-2.5 rounded border transition-colors cursor-pointer ${
                  selectedRxOption === option.id
                    ? 'border-[#006a61] bg-[#006a61]/5'
                    : 'border-[#e2e8f0] bg-[#f2f4f6] hover:bg-[#eceef0]'
                }`}
              >
                <input
                  type="radio"
                  name="rx_option"
                  value={option.id}
                  checked={selectedRxOption === option.id}
                  onChange={() => setSelectedRxOption(option.id)}
                  className="mt-1 text-[#006a61] focus:ring-[#006a61]"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-[#191c1e]">
                    {option.title}
                  </span>
                  <span className="text-[11px] text-[#475569] leading-normal">
                    {option.description}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Interactive Review Note Form */}
        <div className="pt-1 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
            Clinical Pharmacist Review &amp; Sign-Off Note
          </label>
          <textarea
            value={pharmacistNote}
            onChange={(e) => setPharmacistNote(e.target.value)}
            className="w-full p-2.5 rounded bg-[#f2f4f6] border border-[#cbd5e1] text-[#191c1e] text-xs outline-none focus:border-[#006a61] focus:bg-white transition-all leading-relaxed"
            rows={3}
            placeholder="Enter clinical assessment, physician communication rationale, and titration timeline..."
          ></textarea>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={handleAcknowledge}
              type="button"
              className={`h-9 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer ${
                isAcknowledged
                  ? 'bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]'
                  : 'bg-[#006a61] text-white hover:bg-[#006f66]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge Finding'}</span>
            </button>

            <button
              onClick={handleSaveNote}
              type="button"
              className="h-9 px-2 rounded bg-[#e6e8ea] hover:bg-[#e0e3e5] text-[#191c1e] text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border border-[#cbd5e1]"
            >
              <span className="material-symbols-outlined text-[16px]">post_add</span>
              <span>Save to EHR</span>
            </button>
          </div>

          {showToast && (
            <div className="text-center py-1.5 px-2 text-[11px] font-semibold text-[#065f46] bg-[#d1fae5] border border-[#a7f3d0] rounded animate-fade-in">
              {toastMessage}
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderBiometricsWidget = () => (
    <section className="bg-white rounded-xl p-3.5 shadow-2xs border border-[#e2e8f0]">
      <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#191c1e] mb-2.5 flex items-center justify-between">
        <span>Patient Biometric Twin Status</span>
        <span className="text-xs text-[#006a61] font-mono font-bold">{patient.id}</span>
      </h3>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between py-1.5 px-2 rounded bg-[#f2f4f6]">
          <span className="text-[#475569]">Demographics</span>
          <span className="font-semibold text-[#191c1e]">
            {biometrics.age} YO {biometrics.sex} • {biometrics.smoking}
          </span>
        </div>
        <div className="flex justify-between py-1.5 px-2 rounded bg-[#f2f4f6]">
          <span className="text-[#475569]">Height / Weight / BMI</span>
          <span className="font-mono text-[#191c1e]">
            {biometrics.heightCm} cm • {biometrics.weightKg} kg • {biometrics.bmi} kg/m²
          </span>
        </div>
        <div className="flex justify-between py-1.5 px-2 rounded bg-[#f2f4f6]">
          <span className="text-[#475569]">Ideal Body Weight (IBW)</span>
          <span className="font-mono text-[#191c1e]">
            {biometrics.ibwKg} kg (Cockcroft-Gault basis)
          </span>
        </div>
        <div className="flex justify-between py-1.5 px-2 rounded bg-[#f2f4f6]">
          <span className="text-[#475569]">Active Diagnoses</span>
          <span className="text-[11px] text-[#191c1e] text-right max-w-[200px]">
            {biometrics.diagnoses.join(', ')}
          </span>
        </div>
        <div className="flex justify-between py-1.5 px-2 rounded bg-[#f2f4f6]">
          <span className="text-[#475569]">Known Drug Allergies</span>
          <span className="text-xs text-[#991b1b] font-bold">
            {biometrics.allergies.join(', ')}
          </span>
        </div>
      </div>
    </section>
  );

  const renderRecentScenariosWidget = () => (
    <section className="bg-white rounded-xl p-3.5 shadow-2xs border border-[#e2e8f0]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#191c1e]">
          Recent Synthetic Scenarios
        </h3>
        <button
          onClick={() => onNavigateTab('clinical-scenarios')}
          className="text-[11px] text-[#006a61] hover:underline cursor-pointer font-semibold"
        >
          View All ({Object.keys(PATIENT_CASES).length})
        </button>
      </div>
      <div className="space-y-1.5">
        {Object.values(PATIENT_CASES).map((item) => {
          const isActive = item.id === patient.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectPatient(item.id)}
              className={`p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-[#f2f4f6] border-[#006a61]'
                  : 'border-transparent hover:bg-[#f2f4f6]'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#14b8a6]' : 'bg-[#cbd5e1]'}`}></span>
                  <span className="font-bold text-xs text-[#191c1e]">{item.id}</span>
                  {isActive && (
                    <span className="text-[10px] px-1 rounded bg-[#006a61]/10 text-[#006a61] font-semibold">
                      Active
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#475569] truncate">
                  {item.summary}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#92400e] shrink-0">
                {item.id === 'DEMO-PT-0241'
                  ? `eGFR ${item.organStatus.renal.egfr}`
                  : item.id === 'DEMO-PT-0108'
                  ? 'INR 3.4'
                  : 'QTc 488ms'}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderWidgetContent = (widgetId: string) => {
    switch (widgetId) {
      case 'organ-profile':
        return renderOrganProfileWidget();
      case 'medication-review':
        return renderMedicationReviewWidget();
      case 'rules-trace':
        return renderRulesTraceWidget();
      case 'priority-triage':
        return renderPriorityTriageWidget();
      case 'biometrics':
        return renderBiometricsWidget();
      case 'recent-scenarios':
        return renderRecentScenariosWidget();
      default:
        return null;
    }
  };

  const renderWidget = (
    id: string,
    column: 'left' | 'right',
    index: number,
    totalInCol: number
  ) => {
    const isDragging = draggedWidgetId === id;
    const isOverThis = dragOverCol === column && dragOverIndex === index && draggedWidgetId !== id;
    const isCollapsed = Boolean(collapsedWidgets[id]);
    const meta = WIDGET_CONFIG[id] || {
      title: id,
      shortLabel: id,
      icon: 'widgets',
      category: 'Widget'
    };

    return (
      <div key={id} className="flex flex-col gap-2">
        {/* Visual Drop Target Indicator before widget */}
        {isOverThis && (
          <div className="h-10 rounded-xl border-2 border-dashed border-teal-500 bg-[#E6F4F1]0/10 flex items-center justify-center gap-2 text-[#0F766E] text-xs font-bold animate-pulse shadow-2xs">
            <span className="material-symbols-outlined text-[17px]">south</span>
            <span>Drop "{meta.shortLabel}" Here</span>
          </div>
        )}

        {/* Draggable Card Wrapper */}
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, id, column, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOverItem(e, column, index)}
          onDrop={(e) => handleDropOnItem(e, column, index)}
          className={`group transition-all duration-200 rounded-xl ${
            isDragging
              ? 'opacity-40 scale-[0.98] ring-2 ring-teal-500 ring-offset-2'
              : 'hover:shadow-xs'
          }`}
        >
          {/* Clinician Drag Handle & Layout Customization Bar */}
          <div className="bg-slate-100/95 hover:bg-slate-200/90 px-3 py-1.5 rounded-t-xl border-t border-x border-slate-200/90 flex items-center justify-between text-xs transition-colors select-none">
            <div
              className="flex items-center gap-2 cursor-grab active:cursor-grabbing font-bold text-slate-700 hover:text-[#0F766E]"
              title="Click and drag by this handle to reposition widget anywhere on your workspace"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#14B8A6] transition-colors">
                drag_indicator
              </span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#0F766E]">
                  {meta.icon}
                </span>
                <span className="text-[11px] font-semibold tracking-tight text-slate-800">
                  {meta.shortLabel}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200/90 text-slate-600 uppercase">
                {column === 'left' ? 'Col A' : 'Col B'} #{index + 1}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Quick Shift Up */}
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveWidgetWithinCol(column, index, index - 1)}
                className="w-6 h-6 rounded hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Shift widget up"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
              </button>

              {/* Quick Shift Down */}
              <button
                type="button"
                disabled={index === totalInCol - 1}
                onClick={() => moveWidgetWithinCol(column, index, index + 1)}
                className="w-6 h-6 rounded hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Shift widget down"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
              </button>

              {/* Shift to Other Column */}
              <button
                type="button"
                onClick={() => moveWidgetToOtherCol(id, column)}
                className="h-6 px-1.5 rounded hover:bg-white flex items-center gap-0.5 text-[10px] font-semibold text-slate-600 hover:text-[#0F766E] cursor-pointer transition-colors"
                title={`Move to ${column === 'left' ? 'Right' : 'Left'} Column`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {column === 'left' ? 'arrow_forward' : 'arrow_back'}
                </span>
                <span className="font-mono text-[10px] hidden sm:inline">
                  {column === 'left' ? '→ Col B' : 'Col A ←'}
                </span>
              </button>

              {/* Collapse / Expand */}
              <button
                type="button"
                onClick={() => toggleCollapse(id)}
                className="w-6 h-6 rounded hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                title={isCollapsed ? 'Expand Widget' : 'Collapse Widget'}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {isCollapsed ? 'expand_more' : 'expand_less'}
                </span>
              </button>
            </div>
          </div>

          {/* Widget Content or Collapsed Placeholder */}
          {isCollapsed ? (
            <div className="p-3 bg-white border border-slate-200 rounded-b-xl flex items-center justify-between text-xs text-slate-500">
              <span className="italic flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#14B8A6]">visibility_off</span>
                Widget collapsed ({meta.title})
              </span>
              <button
                type="button"
                onClick={() => toggleCollapse(id)}
                className="text-[11px] font-bold text-[#0F766E] hover:underline cursor-pointer"
              >
                Expand view
              </button>
            </div>
          ) : (
            <div className="[&>section]:rounded-t-none [&>section]:border-t-0">
              {renderWidgetContent(id)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full space-y-5">
      {/* Triage Hero & Status Context Strip */}
      <section className="relative bg-[#0d1c32] text-white rounded-xl p-4 shadow-md overflow-hidden">
        <div className="absolute -right-16 -top-24 w-80 h-80 rounded-full bg-[#006a61]/15 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#006a61] text-white text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] animate-pulse"></span>
                Tier-4 Educational Simulation Workspace
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-[#89f5e7] text-xs font-mono font-medium">
                SYNTHETIC PATIENT ID: {patient.id}
              </span>
              <span className="text-[11px] text-[#fde68a] bg-[#162a36]/60 px-2 py-0.5 rounded font-medium">
                {biometrics.diagnoses.slice(0, 3).join(' • ')}
              </span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-xl text-white tracking-tight">
              Clinical Decision Support Matrix &amp; Pharmacokinetic Twin
            </h1>
            <p className="text-xs text-[#76849f] leading-relaxed">
              Transparent, deterministic rule-based evaluation engine for PharmD regimen triage. All algorithmic recommendations represent synthetic predictive models requiring independent licensed clinician sign-off prior to therapy modification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start xl:self-center">
            {/* Switch Synthetic Case Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-9 px-3 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-[#14b8a6]">
                  switch_account
                </span>
                <span>Switch Synthetic Case</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-white text-[#191c1e] rounded-lg shadow-xl py-1 z-50 border border-[#e2e8f0]">
                  <div className="px-3 py-1 text-[10px] font-bold text-[#475569] uppercase tracking-wider border-b border-[#f1f5f9]">
                    Validated Test Cohorts
                  </div>
                  {Object.values(PATIENT_CASES).map((caseItem) => (
                    <button
                      key={caseItem.id}
                      onClick={() => {
                        onSelectPatient(caseItem.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-[#f2f4f6] transition-colors flex flex-col ${
                        caseItem.id === patient.id ? 'bg-[#006a61]/5 border-l-2 border-[#006a61]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          caseItem.id === patient.id ? 'text-[#006a61]' : 'text-[#191c1e]'
                        }`}>
                          {caseItem.id} {caseItem.id === patient.id ? '(Active)' : ''}
                        </span>
                        <span className="text-[10px] text-[#64748b]">
                          {caseItem.tier}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#475569] truncate">
                        {caseItem.summary}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {onExportPdf && (
              <button
                onClick={onExportPdf}
                type="button"
                className="h-9 px-3 rounded bg-white text-slate-800 border border-[#e2e8f0] hover:bg-[#E6F4F1] hover:border-[#14B8A6] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Export Structured Clinical PDF"
              >
                <span className="material-symbols-outlined text-[18px] text-[#006a61]">picture_as_pdf</span>
                <span>Export PDF</span>
              </button>
            )}

            <button
              onClick={onOpenNewAssessment}
              className="h-9 px-3 rounded bg-[#006a61] text-white hover:bg-[#006f66] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>New Twin Assessment</span>
            </button>
          </div>
        </div>
      </section>

      {/* High-Density Clinical KPI Quad */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Regimen */}
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Active Regimen
              </span>
              <div className="w-7 h-7 rounded bg-[#006a61]/10 flex items-center justify-center text-[#006a61]">
                <span className="material-symbols-outlined text-[18px]">prescriptions</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#191c1e]">
                0{patient.kpis.activeAgentsCount}
              </span>
              <span className="text-xs text-[#475569]">concurrent agents</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#006a61] text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
              <span>Reconciliation Synced ({patient.kpis.reconciliationSynced})</span>
            </div>
          </div>
          <div className="mt-2 pt-1.5 bg-[#f2f4f6] rounded p-2 text-[#44474d] text-xs truncate">
            {patient.medications.map((m) => m.name.split(' ')[0]).join(' • ')}
          </div>
        </div>

        {/* Card 2: Critical Signals */}
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#92400e] uppercase tracking-wider">
                Critical Signals
              </span>
              <div className="w-7 h-7 rounded bg-[#fef3c7] flex items-center justify-center text-[#92400e]">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#92400e]">
                0{patient.kpis.actionAlertsCount}
              </span>
              <span className="text-xs text-[#92400e] font-bold">Action Alerts</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#92400e] text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#92400e] animate-ping"></span>
              <span>{patient.kpis.alertSummary}</span>
            </div>
          </div>
          <div className="mt-2 pt-1.5 bg-[#fef3c7]/40 rounded p-2 text-[#92400e] text-xs truncate font-medium">
            {patient.priorityTriage.title}
          </div>
        </div>

        {/* Card 3: Monitoring Protocol */}
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Monitoring Protocol
              </span>
              <div className="w-7 h-7 rounded bg-[#162a36]/10 flex items-center justify-center text-[#0f2b38]">
                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#191c1e]">
                0{patient.kpis.pendingLabsCount}
              </span>
              <span className="text-xs text-[#475569]">pending serial labs</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#475569] text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#cbd5e1]"></span>
              <span>Next Draw: {patient.kpis.nextDraw}</span>
            </div>
          </div>
          <div className="mt-2 pt-1.5 bg-[#f2f4f6] rounded p-2 text-[#44474d] text-xs flex justify-between font-mono">
            <span>K+ (14d)</span>
            <span>SCr/eGFR (30d)</span>
            <span>A1c (90d)</span>
          </div>
        </div>

        {/* Card 4: Traceable Guidelines */}
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Traceable Guidelines
              </span>
              <div className="w-7 h-7 rounded bg-[#86f2e4]/30 flex items-center justify-center text-[#006a61]">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#191c1e]">
                {patient.kpis.evidenceLinksCount}
              </span>
              <span className="text-xs text-[#475569]">evidence links</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#006a61] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              <span>{patient.kpis.guidelinesSummary}</span>
            </div>
          </div>
          <div className="mt-2 pt-1.5 bg-[#f2f4f6] rounded p-2 text-[#44474d] text-xs truncate">
            Level-A evidence matched to renal profile
          </div>
        </div>
      </section>

      {/* Main Customizable Workspace Layout Container (Selected Element for Drag & Drop Customization) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start transition-all duration-300 relative bg-slate-50/50 p-2 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Workspace Customizer Toolbar (Spanning full width) */}
        <div className="lg:col-span-12 bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] border border-[#BEE3DB] flex items-center justify-center text-[#0F766E]">
              <span className="material-symbols-outlined text-[19px]">dashboard_customize</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-slate-900">
                  Clinician Workspace Customization
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#E6F4F1] text-[#0F766E] border border-[#BEE3DB]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6F4F1]0 animate-pulse"></span>
                  Drag &amp; Drop Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Drag widgets by the <span className="font-semibold text-slate-700">⠿ handle</span> to reorder, shift columns, or toggle layout presets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLayoutMode('asymmetric');
                  saveLayout(colLeft, colRight, 'asymmetric');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  layoutMode === 'asymmetric'
                    ? 'bg-white text-[#0F766E] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Standard (8 / 4) Column Split"
              >
                <span className="material-symbols-outlined text-[14px]">view_sidebar</span>
                <span>Standard (8:4)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLayoutMode('balanced');
                  saveLayout(colLeft, colRight, 'balanced');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  layoutMode === 'balanced'
                    ? 'bg-white text-[#0F766E] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Balanced (6 / 6) Equal Split"
              >
                <span className="material-symbols-outlined text-[14px]">view_column</span>
                <span>Balanced (6:6)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLayoutMode('inverted');
                  saveLayout(colLeft, colRight, 'inverted');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  layoutMode === 'inverted'
                    ? 'bg-white text-[#0F766E] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Priority First (4 / 8) Split"
              >
                <span className="material-symbols-outlined text-[14px]">view_stream</span>
                <span>Priority First (4:8)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetLayout}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Reset widgets to standard layout"
            >
              <span className="material-symbols-outlined text-[14px] text-slate-500">restart_alt</span>
              <span>Reset Layout</span>
            </button>
          </div>
        </div>

        {/* COLUMN A (Left Column) */}
        <div
          onDragOver={(e) => handleDragOverColumn(e, 'left')}
          onDrop={(e) => handleDropOnColumnEnd(e, 'left')}
          className={`${
            layoutMode === 'asymmetric'
              ? 'lg:col-span-8'
              : layoutMode === 'balanced'
              ? 'lg:col-span-6'
              : 'lg:col-span-4'
          } flex flex-col gap-5 min-w-0 transition-all duration-300`}
        >
          {colLeft.length === 0 && (
            <div
              onDragOver={(e) => handleDragOverColumn(e, 'left')}
              onDrop={(e) => handleDropOnColumnEnd(e, 'left')}
              className="h-32 rounded-xl border-2 border-dashed border-slate-300 bg-white/60 flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs p-4 text-center"
            >
              <span className="material-symbols-outlined text-[28px] text-slate-300">move_to_inbox</span>
              <span className="font-semibold text-slate-600">Column A is empty</span>
              <span className="text-[11px] text-slate-400">Drag any widget here or click '→ Col A' on any widget</span>
            </div>
          )}

          {colLeft.map((widgetId, index) => renderWidget(widgetId, 'left', index, colLeft.length))}

          {/* Bottom Drop Zone for Column A */}
          {draggedWidgetId && (
            <div
              onDragOver={(e) => handleDragOverColumn(e, 'left')}
              onDrop={(e) => handleDropOnColumnEnd(e, 'left')}
              className={`rounded-xl border-2 border-dashed transition-all duration-200 ${
                dragOverCol === 'left' && dragOverIndex === null
                  ? 'h-14 border-teal-500 bg-[#E6F4F1]/80 flex items-center justify-center text-[#0F766E] text-xs font-bold gap-2 animate-pulse'
                  : 'h-4 border-transparent'
              }`}
            >
              {dragOverCol === 'left' && dragOverIndex === null && (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Drop at end of Column A</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* COLUMN B (Right Column) */}
        <div
          onDragOver={(e) => handleDragOverColumn(e, 'right')}
          onDrop={(e) => handleDropOnColumnEnd(e, 'right')}
          className={`${
            layoutMode === 'asymmetric'
              ? 'lg:col-span-4'
              : layoutMode === 'balanced'
              ? 'lg:col-span-6'
              : 'lg:col-span-8'
          } flex flex-col gap-5 min-w-0 transition-all duration-300`}
        >
          {colRight.length === 0 && (
            <div
              onDragOver={(e) => handleDragOverColumn(e, 'right')}
              onDrop={(e) => handleDropOnColumnEnd(e, 'right')}
              className="h-32 rounded-xl border-2 border-dashed border-slate-300 bg-white/60 flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs p-4 text-center"
            >
              <span className="material-symbols-outlined text-[28px] text-slate-300">move_to_inbox</span>
              <span className="font-semibold text-slate-600">Column B is empty</span>
              <span className="text-[11px] text-slate-400">Drag any widget here or click '→ Col B' on any widget</span>
            </div>
          )}

          {colRight.map((widgetId, index) => renderWidget(widgetId, 'right', index, colRight.length))}

          {/* Bottom Drop Zone for Column B */}
          {draggedWidgetId && (
            <div
              onDragOver={(e) => handleDragOverColumn(e, 'right')}
              onDrop={(e) => handleDropOnColumnEnd(e, 'right')}
              className={`rounded-xl border-2 border-dashed transition-all duration-200 ${
                dragOverCol === 'right' && dragOverIndex === null
                  ? 'h-14 border-teal-500 bg-[#E6F4F1]/80 flex items-center justify-center text-[#0F766E] text-xs font-bold gap-2 animate-pulse'
                  : 'h-4 border-transparent'
              }`}
            >
              {dragOverCol === 'right' && dragOverIndex === null && (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Drop at end of Column B</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Workspace Metadata & Clinical Disclaimers */}
      <section className="mt-4 mb-2 p-3 rounded-xl bg-[#f2f4f6] border border-[#e2e8f0] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#162a36] text-white flex items-center justify-center font-bold text-xs tracking-wider">
            SYN
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-[#191c1e]">
              SYNTHOS Clinical Twin Verification Protocol v3.8.2
            </span>
            <span className="text-[11px] text-[#475569] font-mono">
              Deterministic Rule ID: CDS-REN-4209 • Engine Hash: 8f9b2d3e • Generated with Synthetic Patient Data
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#475569] text-xs">
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[16px] text-[#14b8a6]">lock</span>
            HIPAA-Free Synthetic Data
          </span>
          <span>•</span>
          <span className="font-medium">For Professional Decision Support Only</span>
        </div>
      </section>
    </div>
  );
};
