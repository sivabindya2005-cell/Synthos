import React, { useState } from 'react';
import { PatientCase } from '../../types/clinical';

interface MonitoringPlanViewProps {
  patient: PatientCase;
}

export const MonitoringPlanView: React.FC<MonitoringPlanViewProps> = ({ patient }) => {
  const [labs, setLabs] = useState([
    {
      id: 'lab-1',
      name: 'Basic Metabolic Panel (Serum K+ & SCr)',
      timeline: 'In 14 Days',
      days: 14,
      indication: 'Monitor Lisinopril ACEi potassium retention & Metformin renal status',
      threshold: 'Hold ACEi if K+ > 5.5 mEq/L or SCr rises > 30%',
      ordered: false
    },
    {
      id: 'lab-2',
      name: 'Serum Creatinine & eGFR Repeat',
      timeline: 'In 30 Days',
      days: 30,
      indication: 'Evaluate stability of CKD 3b clearance after Metformin dose reduction',
      threshold: 'Re-evaluate if eGFR declines below 30 mL/min/1.73m²',
      ordered: false
    },
    {
      id: 'lab-3',
      name: 'Hemoglobin A1c & Fasting Lipids',
      timeline: 'In 90 Days',
      days: 90,
      indication: 'Assess glycemic trajectory following SGLT2i addition or Metformin taper',
      threshold: 'Individualized target <7.5% - 8.0% in moderate CKD',
      ordered: false
    },
    {
      id: 'lab-4',
      name: 'Urine Albumin-to-Creatinine Ratio (UACR)',
      timeline: 'In 90 Days',
      days: 90,
      indication: 'Evaluate antiproteinuric efficacy of Lisinopril/SGLT2i',
      threshold: 'Target >30% reduction from baseline 145 mg/g',
      ordered: false
    }
  ]);

  const toggleOrder = (id: string) => {
    setLabs(labs.map((l) => (l.id === id ? { ...l, ordered: !l.ordered } : l)));
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#0d1c32] text-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            <span className="text-xs font-mono text-[#86f2e4] font-bold">SAFETY &amp; SURVEILLANCE PROTOCOL</span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Serial Laboratory Monitoring &amp; Surveillance Schedule
          </h2>
          <p className="text-xs text-[#76849f]">
            Scheduled lab draws, critical threshold safety stops, and automated re-check triggers for {patient.id}.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5DDD0] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#1E3A8A] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#15803D] text-[20px]">checklist</span>
            <span>Surveillance Lab Checklist ({labs.filter(l => l.ordered).length}/{labs.length} Ordered)</span>
          </h3>
          <button
            onClick={() => setLabs(labs.map(l => ({ ...l, ordered: true })))}
            className="text-xs text-[#15803D] font-bold hover:underline cursor-pointer"
          >
            Order All Pending
          </button>
        </div>

        <div className="space-y-3">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                lab.ordered
                  ? 'bg-[#d1fae5]/30 border-[#a7f3d0]'
                  : 'bg-[#FAF7F2] border-[#E5DDD0]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1E3A8A]">{lab.name}</span>
                  <span className="px-2 py-0.5 rounded bg-white text-[#4B6584] font-mono text-xs font-semibold border border-[#cbd5e1]">
                    {lab.timeline}
                  </span>
                </div>
                <p className="text-xs text-[#4B6584]">{lab.indication}</p>
                <div className="text-[11px] font-semibold text-[#92400e] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">crisis_alert</span>
                  <span>Safety Stop Threshold: {lab.threshold}</span>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => toggleOrder(lab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    lab.ordered
                      ? 'bg-[#065f46] text-white'
                      : 'bg-[#15803D] text-white hover:bg-[#006f66]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {lab.ordered ? 'check_circle' : 'add'}
                  </span>
                  <span>{lab.ordered ? 'Requisition Signed' : 'Order Lab Draw'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
