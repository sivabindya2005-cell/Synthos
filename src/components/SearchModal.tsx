import React, { useState, useEffect } from 'react';
import { EVIDENCE_RULES } from '../data/evidenceRules';
import { PATIENT_CASES } from '../data/patientCases';
import { PatientCase } from '../types/clinical';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search through all patient cases' medications
  const matchedMeds: { medName: string; patientId: string; dose: string }[] = [];
  Object.values(PATIENT_CASES).forEach((pt) => {
    pt.medications.forEach((m) => {
      if (m.name.toLowerCase().includes(query.toLowerCase()) || m.therapeuticClass.toLowerCase().includes(query.toLowerCase())) {
        matchedMeds.push({ medName: m.name, patientId: pt.id, dose: m.dose });
      }
    });
  });

  const matchedRules = EVIDENCE_RULES.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.code.toLowerCase().includes(query.toLowerCase()) ||
      r.summary.toLowerCase().includes(query.toLowerCase())
  );

  const SYSTEM_SHORTCUTS = [
    { title: 'Clinical Evidence Search (UpToDate / Free Engines)', desc: 'Search PubMed Central, NIH DailyMed, Europe PMC, and UpToDate without sign-in', tabId: 'clinical-search', icon: 'manage_search', keywords: ['search', 'uptodate', 'pubmed', 'dailymed', 'europe pmc', 'scholar', 'evidence', 'guidelines'] },
    { title: 'Diagnostic Lab Specimen & SOAP Report', desc: 'LOINC-codified lab panels, reference ranges, and serial requisitions', tabId: 'reports', icon: 'biotech', keywords: ['lab', 'report', 'specimen', 'soap', 'loinc', 'bmp', 'cmp', 'egfr', 'inr'] },
    { title: 'Digital Twin Pharmacokinetic Simulator', desc: 'Multi-dose steady-state curve simulation & organ sliders', tabId: 'digital-twin', icon: 'tune', keywords: ['twin', 'simulator', 'pk', 'clearance', 'curve', 'steady state'] },
    { title: 'Genomics & Pharmacogenomic VCF Scanner', desc: 'VCF file variant annotation, diplotypes & CPIC Level 1A guidelines', tabId: 'genomic-scanner', icon: 'biotech', keywords: ['genomic', 'vcf', 'pgx', 'cyp2c9', 'cyp2c19', 'allele', 'cpic'] },
    { title: 'FHIR R4 EHR Interoperability Sync', desc: 'Ingest Epic / Cerner US Core Bundles and export ClinicalImpression', tabId: 'fhir-integration', icon: 'sync_alt', keywords: ['fhir', 'ehr', 'epic', 'cerner', 'bundle', 'interoperability'] },
    { title: 'Drug Explorer & Monograph Catalog (305+)', desc: 'FDA labels, molecular targets, binding affinities & clinical trials', tabId: 'drug-explorer', icon: 'auto_stories', keywords: ['drug', 'monograph', 'pharmacopeia', 'fda', 'targets'] }
  ];

  const matchedShortcuts = SYSTEM_SHORTCUTS.filter(s =>
    query.trim().length > 1 && (
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.desc.toLowerCase().includes(query.toLowerCase()) ||
      s.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
    )
  );

  const matchedPatients = Object.values(PATIENT_CASES).filter(
    (p) =>
      p.id.toLowerCase().includes(query.toLowerCase()) ||
      p.summary.toLowerCase().includes(query.toLowerCase()) ||
      p.biometrics.diagnoses.some((d) => d.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-[#E5DDD0] overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#E5DDD0] flex items-center gap-3 bg-[#FAF7F2]">
          <span className="material-symbols-outlined text-[#75777e] text-[20px]">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medications, KDIGO/CPIC rules, patient IDs, contraindications..."
            className="w-full text-sm text-[#1E3A8A] bg-transparent outline-none placeholder:text-[#94a3b8]"
          />
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-[#eceef0] text-[#4B6584] hover:bg-[#e0e3e5]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Platform Shortcuts */}
          {matchedShortcuts.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider mb-1.5 px-2 font-mono">
                Platform Workspaces &amp; Engines
              </div>
              <div className="space-y-1">
                {matchedShortcuts.map((sc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigateTab(sc.tabId);
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-[#EEF7EE]/50 hover:bg-[#D4ECE6]/70 border border-[#CBE4CB]/60 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#15803D] text-[18px]">{sc.icon}</span>
                      <div>
                        <span className="font-bold text-slate-900 block">{sc.title}</span>
                        <span className="text-[10px] text-slate-500">{sc.desc}</span>
                      </div>
                    </div>
                    <span className="text-[#15803D] text-xs font-semibold group-hover:translate-x-1 transition-transform">
                      Open →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct Medical Search Engine Hub Launch */}
          {query.trim().length > 1 && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 border border-[#CBE4CB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#15803D] text-[20px]">manage_search</span>
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    Search UpToDate, PubMed Central &amp; DailyMed for &ldquo;{query}&rdquo;
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Query free no-sign-in medical search engines &amp; clinical practice consensus
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onNavigateTab('clinical-search');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#15803D] hover:bg-teal-900 text-white font-bold text-xs cursor-pointer shrink-0 transition-colors"
              >
                Launch Search →
              </button>
            </div>
          )}

          {/* Patient Matches */}
          {matchedPatients.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-[#4B6584] uppercase tracking-wider mb-1.5 px-2">
                Synthetic Patient Cohorts
              </div>
              <div className="space-y-1">
                {matchedPatients.map((pt) => (
                  <button
                    key={pt.id}
                    onClick={() => {
                      onSelectPatient(pt.id);
                      onNavigateTab('overview');
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded hover:bg-[#f1f5f9] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#15803D] text-[18px]">person</span>
                      <span className="font-bold text-[#1E3A8A]">{pt.id}</span>
                      <span className="text-[#4B6584]">{pt.summary}</span>
                    </div>
                    <span className="text-[#15803D] text-[11px] font-semibold group-hover:underline">
                      Load Case →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rule Matches */}
          {matchedRules.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-[#4B6584] uppercase tracking-wider mb-1.5 px-2">
                Evidence Rules &amp; FDA Boxed Warnings
              </div>
              <div className="space-y-1">
                {matchedRules.map((rule) => (
                  <button
                    key={rule.id}
                    onClick={() => {
                      onNavigateTab('evidence-library');
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded hover:bg-[#f1f5f9] flex flex-col gap-0.5 group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0f2b38]">{rule.code}: {rule.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#15803D]/10 text-[#15803D] font-semibold">
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-[#4B6584] line-clamp-1">{rule.summary}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Medication Matches */}
          {matchedMeds.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-[#4B6584] uppercase tracking-wider mb-1.5 px-2">
                Regimen Formularies
              </div>
              <div className="space-y-1">
                {matchedMeds.map((med, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectPatient(med.patientId);
                      onNavigateTab('medication-review');
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded hover:bg-[#f1f5f9] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-[#1E3A8A]">{med.medName}</span>
                      <span className="text-[#4B6584] ml-2">({med.dose})</span>
                    </div>
                    <span className="text-xs text-[#15803D] font-medium">In {med.patientId} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedPatients.length === 0 && matchedRules.length === 0 && matchedMeds.length === 0 && (
            <div className="py-8 text-center text-[#4B6584]">
              No direct matches found for "{query}". Try searching "Metformin", "eGFR", "Warfarin", or "KDIGO".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#F4EFE6] border-t border-[#E5DDD0] flex items-center justify-between text-[11px] text-[#4B6584]">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#cbd5e1] font-mono">↵ to select</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#cbd5e1] font-mono">ESC to close</kbd>
          </div>
          <span className="text-[#15803D] font-semibold">SYNTHOS Clinical Search Index</span>
        </div>
      </div>
    </div>
  );
};
