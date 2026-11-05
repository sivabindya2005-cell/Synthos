import React, { useState, useMemo } from 'react';
import { DRUG_MONOGRAPHS, TARGET_SUPERFAMILIES } from '../../data/drugIntelligenceData';
import { DrugMonograph } from '../../types/clinical';

interface DrugIntelligenceViewProps {
  onOpenProvenance: (provenanceId: string) => void;
  onLaunchTwin: () => void;
}

const SPECIALTY_OPTIONS = [
  { id: 'all', label: 'All Specialties' },
  { id: 'cardiometabolic', label: 'Cardiometabolic' },
  { id: 'oncology', label: 'Oncology' },
  { id: 'neurology', label: 'Neurology' },
  { id: 'psychiatry', label: 'Psychiatry' },
  { id: 'immunology', label: 'Immunology & Rheum' },
  { id: 'hematology', label: 'Hematology' },
  { id: 'infectious', label: 'Infectious Disease' },
  { id: 'respiratory', label: 'Pulmonology' },
  { id: 'gastroenterology', label: 'Gastroenterology' },
  { id: 'endocrinology', label: 'Endocrinology' },
  { id: 'ophthalmology', label: 'Ophthalmology' },
  { id: 'dermatology', label: 'Dermatology' }
];

export const DrugIntelligenceView: React.FC<DrugIntelligenceViewProps> = ({
  onOpenProvenance,
  onLaunchTwin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedSuperfamily, setSelectedSuperfamily] = useState<string>('All Target Families');
  const [activeDrug, setActiveDrug] = useState<DrugMonograph>(DRUG_MONOGRAPHS[0]);
  const [detailTab, setDetailTab] = useState<'overview' | 'targets' | 'pk' | 'pgx' | 'trials'>('overview');

  const filteredDrugs = useMemo(() => {
    return DRUG_MONOGRAPHS.filter((drug) => {
      // Specialty check
      const matchesSpecialty =
        selectedSpecialty === 'all' ||
        drug.specialty.toLowerCase() === selectedSpecialty.toLowerCase();

      // Target superfamily check
      let matchesSuperfamily = true;
      if (selectedSuperfamily !== 'All Target Families') {
        const sf = (drug.targetSuperfamily || '').toLowerCase();
        const targetFamilyName = selectedSuperfamily.toLowerCase();

        if (targetFamilyName.includes('gpcr')) {
          matchesSuperfamily = sf.includes('gpcr') || sf.includes('g-protein');
        } else if (targetFamilyName.includes('kinase')) {
          matchesSuperfamily = sf.includes('kinase') || sf.includes('rtk') || sf.includes('tyrosine');
        } else if (targetFamilyName.includes('enzyme')) {
          matchesSuperfamily = sf.includes('enzyme') || sf.includes('hydrolase') || sf.includes('synthetase') || sf.includes('reductase') || sf.includes('protease') || sf.includes('polymerase') || sf.includes('integrase');
        } else if (targetFamilyName.includes('ion channel')) {
          matchesSuperfamily = sf.includes('channel') || sf.includes('cav') || sf.includes('nav') || sf.includes('gaba');
        } else if (targetFamilyName.includes('transporter')) {
          matchesSuperfamily = sf.includes('transporter') || sf.includes('slc') || sf.includes('sglt') || sf.includes('pump');
        } else if (targetFamilyName.includes('nuclear')) {
          matchesSuperfamily = sf.includes('nuclear') || sf.includes('receptor - estrogen') || sf.includes('receptor - androgen') || sf.includes('ppar') || sf.includes('glucocorticoid') || sf.includes('thyroid');
        } else if (targetFamilyName.includes('biologic') || targetFamilyName.includes('checkpoint')) {
          matchesSuperfamily = sf.includes('biologic') || sf.includes('monoclonal') || sf.includes('checkpoint') || sf.includes('cytokine') || sf.includes('antibody');
        } else if (targetFamilyName.includes('ribosomal') || targetFamilyName.includes('bacterial')) {
          matchesSuperfamily = sf.includes('ribosomal') || sf.includes('bacterial') || sf.includes('viral') || sf.includes('fungal') || sf.includes('microbial') || sf.includes('peptidoglycan');
        } else {
          matchesSuperfamily = sf.includes(targetFamilyName);
        }
      }

      // Search term matches generic name, brand names, therapeutic class, molecular targets, or superfamily
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        drug.genericName.toLowerCase().includes(term) ||
        drug.brandNames.some((b) => b.toLowerCase().includes(term)) ||
        drug.therapeuticClass.toLowerCase().includes(term) ||
        (drug.targetSuperfamily && drug.targetSuperfamily.toLowerCase().includes(term)) ||
        drug.molecularTargets.some(
          (t) => t.name.toLowerCase().includes(term) || t.type.toLowerCase().includes(term)
        );

      return matchesSpecialty && matchesSuperfamily && matchesSearch;
    });
  }, [searchTerm, selectedSpecialty, selectedSuperfamily]);

  // Keep active drug valid when filtered list changes
  const currentActiveDrug = useMemo(() => {
    if (filteredDrugs.some((d) => d.id === activeDrug.id)) {
      return activeDrug;
    }
    return filteredDrugs[0] || activeDrug;
  }, [filteredDrugs, activeDrug]);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#0d1c32] text-white rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-mono bg-teal-950/80 text-[#86f2e4] px-2 py-0.5 rounded border border-teal-800/60 font-bold">
              PHARMACEUTICAL INTELLIGENCE · TARGET-CLASSIFIED PHARMACOPEIA
            </span>
            <span className="text-xs text-teal-300 font-mono font-semibold">
              300+ Verified Monographs
            </span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Evidence-Grounded Therapeutic Intelligence &amp; Target Classification
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-0.5">
            Exhaustive precision pharmacopeia of <strong>{DRUG_MONOGRAPHS.length} FDA-approved molecular monographs</strong> with generic and brand names, target superfamilies, binding kinetics, ADME clearance pathways, CPIC pharmacogenomics, and registrational trials.
          </p>
        </div>

        <button
          onClick={onLaunchTwin}
          className="px-3.5 py-2 rounded-lg bg-[#006a61] hover:bg-[#00524b] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Simulate in Patient Twin</span>
        </button>
      </div>

      {/* Target-Wise Superfamily Quick Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#0F766E] text-[16px]">category</span>
            Target-Wise Classification Superfamilies
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Showing <strong className="text-[#0F766E] font-bold">{filteredDrugs.length}</strong> of {DRUG_MONOGRAPHS.length} Drugs
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TARGET_SUPERFAMILIES.map((sf) => {
            const isSelected = selectedSuperfamily === sf;
            return (
              <button
                key={sf}
                onClick={() => setSelectedSuperfamily(sf)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {sf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Drug Selector (4 cols) & Comprehensive Monograph Dossier (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Search, Specialty Filter & 300+ Drug List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2.5">
            {/* Search Box */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search generic, brand (e.g. Lipitor, Keytruda), or target..."
                className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 outline-none focus:border-teal-600 bg-slate-50 focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Specialty Dropdown & Quick Badges */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="specialty-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Specialty:
              </label>
              <select
                id="specialty-select"
                aria-label="Filter drugs by clinical specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full text-xs py-1 px-2 rounded border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:border-teal-600"
              >
                {SPECIALTY_OPTIONS.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Filters Reset */}
            {(searchTerm || selectedSpecialty !== 'all' || selectedSuperfamily !== 'All Target Families') && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-medium">Filtered Results: {filteredDrugs.length}</span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('all');
                    setSelectedSuperfamily('All Target Families');
                  }}
                  className="text-[#0F766E] hover:text-teal-900 font-semibold cursor-pointer underline text-[11px]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Drug List */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
            <div className="max-h-[680px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
              {filteredDrugs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <span className="material-symbols-outlined text-[32px] text-slate-300">medication</span>
                  <p className="text-xs font-semibold text-slate-600">No matching drugs found</p>
                  <p className="text-[11px] text-slate-400">
                    Try relaxing your search query or selecting "All Target Families".
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('all');
                      setSelectedSuperfamily('All Target Families');
                    }}
                    className="mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Reset Search
                  </button>
                </div>
              ) : (
                filteredDrugs.map((drug) => {
                  const isSelected = currentActiveDrug.id === drug.id;
                  return (
                    <div
                      key={drug.id}
                      onClick={() => setActiveDrug(drug)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E6F4F1]/60 border-teal-600 shadow-xs ring-1 ring-teal-600/50'
                          : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div>
                          <div className="font-bold text-xs text-slate-900 leading-tight">
                            {drug.genericName}
                          </div>
                          {drug.brandNames.length > 0 && (
                            <div className="text-[11px] font-semibold text-[#0F766E] mt-0.5">
                              Brand: <span className="font-medium text-slate-700">{drug.brandNames.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
                          FDA {drug.fdaApprovalYear}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {drug.therapeuticClass}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 pt-1 border-t border-slate-100/80">
                        <span className="text-[10px] font-mono font-medium text-slate-600 truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 max-w-[200px]">
                          Target: {drug.molecularTargets[0]?.name || 'Primary Receptor'}
                        </span>
                        <span className="text-[10px] capitalize text-slate-500 ml-auto shrink-0 font-medium">
                          {drug.specialty}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Monograph Dossier */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
          {/* Drug Title & Classification Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono bg-[#E6F4F1] border border-[#BEE3DB] text-[#0F766E] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {currentActiveDrug.therapeuticClass}
                </span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded capitalize">
                  {currentActiveDrug.specialty}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  FDA Approved: {currentActiveDrug.fdaApprovalYear}
                </span>
              </div>

              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-slate-900">
                {currentActiveDrug.genericName}
              </h2>

              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">Trade / Brand Names:</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-800 font-medium">
                  {currentActiveDrug.brandNames.join(' · ')}
                </span>
              </div>

              {currentActiveDrug.targetSuperfamily && (
                <div className="text-xs text-teal-900 bg-[#E6F4F1]/70 border border-[#BEE3DB]/80 px-2.5 py-1 rounded-md mt-1 inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#0F766E]">hub</span>
                  <span className="font-semibold">Target Superfamily:</span>
                  <span>{currentActiveDrug.targetSuperfamily}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={() => onOpenProvenance(currentActiveDrug.id || currentActiveDrug.genericName)}
                className="px-3 py-1.5 rounded-lg bg-[#E6F4F1] border border-[#BEE3DB] text-[#0F766E] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#D4ECE6] transition-colors cursor-pointer"
                title={`Audit scientific provenance & citations for ${currentActiveDrug.genericName}`}
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Provenance &amp; Reg. Trail</span>
              </button>
              <button
                onClick={onLaunchTwin}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Simulate Twin</span>
              </button>
            </div>
          </div>

          {/* Dossier Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold overflow-x-auto">
            {[
              { id: 'overview', label: 'Mechanism & Indications', icon: 'description' },
              { id: 'targets', label: 'Molecular Targets', icon: 'hub' },
              { id: 'pk', label: 'Pharmacokinetics (ADME)', icon: 'biotech' },
              { id: 'pgx', label: 'Pharmacogenomics (CPIC)', icon: 'genetics' },
              { id: 'trials', label: 'Pivotal Trials & Safety', icon: 'shield' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id as any)}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  detailTab === tab.id
                    ? 'border-teal-700 text-[#0F766E] font-bold bg-[#E6F4F1]/30'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="text-xs space-y-4">
            {detailTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Mechanism of Action (MOA)
                    </span>
                    <span className="text-[10px] font-mono text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded border border-[#BEE3DB]">
                      Molecular Specificity
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {currentActiveDrug.mechanismOfAction}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Approved Clinical Indications
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentActiveDrug.approvedIndications.map((ind, i) => (
                      <li
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-slate-800"
                      >
                        <span className="material-symbols-outlined text-[#0F766E] text-[16px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span className="text-xs">{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {currentActiveDrug.biologicalPathways && currentActiveDrug.biologicalPathways.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Modulated Biochemical &amp; Cellular Pathways
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentActiveDrug.biologicalPathways.map((pathway, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-[#E6F4F1] border border-[#BEE3DB] text-teal-900 font-mono text-[11px]"
                        >
                          {pathway}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {detailTab === 'targets' && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Identified Molecular Targets &amp; Binding Kinetics
                </span>
                <div className="space-y-2.5">
                  {currentActiveDrug.molecularTargets.map((target, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{target.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                            {target.type}
                          </span>
                        </div>
                        {target.bindingAffinity && (
                          <div className="text-[11px] font-mono text-[#0F766E] mt-1">
                            Affinity: <strong>{target.bindingAffinity}</strong>
                          </div>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded bg-[#E6F4F1] border border-[#BEE3DB] text-[#0F766E] font-mono text-[11px] font-bold self-start sm:self-center">
                        {target.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === 'pk' && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Absorption, Distribution, Metabolism &amp; Excretion (ADME) Parameters
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Bioavailability</span>
                    <span className="text-slate-800 font-semibold block mt-1 text-xs">
                      {currentActiveDrug.pkParameters.bioavailability}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Volume of Distribution</span>
                    <span className="text-slate-800 font-semibold block mt-1 text-xs">
                      {currentActiveDrug.pkParameters.volumeOfDistribution}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Plasma Protein Binding</span>
                    <span className="text-slate-800 font-semibold block mt-1 text-xs">
                      {currentActiveDrug.pkParameters.proteinBinding}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Elimination Half-Life</span>
                    <span className="text-slate-800 font-semibold block mt-1 text-xs text-teal-900 font-mono">
                      {currentActiveDrug.pkParameters.halfLife}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Clearance Route &amp; Hepatic/Renal Excretion</span>
                  <span className="text-slate-800 font-semibold block mt-1 text-xs leading-relaxed">
                    {currentActiveDrug.pkParameters.clearanceRoute}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Steady State Plasma Dynamics</span>
                  <span className="text-slate-800 font-semibold block mt-1 text-xs">
                    {currentActiveDrug.pkParameters.steadyStateTime}
                  </span>
                </div>
              </div>
            )}

            {detailTab === 'pgx' && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pharmacogenomic Variations &amp; CPIC Dosing Guidance
                </span>
                {currentActiveDrug.pgxConsiderations.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                    No CPIC Level 1 actionable genetic variants mandated for routine clinical dosing titration. Standard organ function monitoring applies.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentActiveDrug.pgxConsiderations.map((pgx, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-900 text-xs">
                            {pgx.gene} ({pgx.alleles})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            CPIC Evidence Tier 1
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs">
                          <strong>Phenotype Effect: </strong>
                          {pgx.phenotypeEffect}
                        </p>
                        <p className="text-indigo-950 text-xs font-semibold bg-white/70 p-2 rounded border border-indigo-100">
                          <strong>Clinical Recommendation: </strong>
                          {pgx.cpicDosingRecommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {detailTab === 'trials' && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Registrational Clinical Trials &amp; Black Box Disclaimers
                </span>

                <div className="space-y-2">
                  {currentActiveDrug.clinicalTrialsReferences.map((trial, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{trial.title}</span>
                        <span className="text-slate-500 text-[11px] font-mono mt-0.5 block">
                          {trial.journalOrTrialId} ({trial.year})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onOpenProvenance(currentActiveDrug.id || currentActiveDrug.genericName)}
                          className="px-2.5 py-1 rounded bg-[#E6F4F1] border border-[#BEE3DB] text-[#0F766E] text-[11px] font-semibold hover:bg-[#D4ECE6] flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          <span>Provenance</span>
                        </button>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          Peer-Reviewed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {currentActiveDrug.criticalAdverseEffects.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-rose-900">
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <span className="material-symbols-outlined text-[16px]">dangerous</span>
                      <span>Critical Safety Warnings &amp; Adverse Event Profiles</span>
                    </div>
                    <ul className="list-disc list-inside text-xs space-y-1 pt-1 text-rose-800">
                      {currentActiveDrug.criticalAdverseEffects.map((ae, idx) => (
                        <li key={idx} className="leading-snug">
                          {ae}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentActiveDrug.contraindications.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-amber-900">
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <span className="material-symbols-outlined text-[16px]">block</span>
                      <span>Absolute &amp; Relative Contraindications</span>
                    </div>
                    <ul className="list-disc list-inside text-xs space-y-1 pt-1 text-amber-800">
                      {currentActiveDrug.contraindications.map((ci, idx) => (
                        <li key={idx} className="leading-snug">
                          {ci}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
