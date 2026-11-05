import React, { useState } from 'react';
import { EVIDENCE_RULES } from '../../data/evidenceRules';
import { EvidenceRule } from '../../types/clinical';

interface EvidenceLibraryViewProps {
  onOpenProvenance?: (id: string) => void;
}

export const EvidenceLibraryView: React.FC<EvidenceLibraryViewProps> = ({ onOpenProvenance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Renal', 'Pharmacogenomics', 'Cardiology', 'FDA Black Box'];

  const getRuleProvenanceId = (ruleId: string): string => {
    switch (ruleId) {
      case 'kdigo-met-2023':
      case 'fda-met-bbw':
        return 'prov-met-renal';
      case 'kdigo-sglt2i-2023':
        return 'prov-sglt2-kdigo';
      case 'aha-ras-2022':
        return 'prov-lis-acei';
      case 'cpic-warf-2017':
        return 'prov-warf-cyp2c9';
      case 'fda-citalopram-2012':
        return 'prov-cit-geriatric';
      case 'acc-statin-2019':
        return 'prov-ator-lipid';
      case 'beers-2023':
        return 'prov-done-beers';
      default:
        return 'prov-met-renal';
    }
  };

  const filteredRules = EVIDENCE_RULES.filter((rule) => {
    const matchesCategory = selectedCategory === 'All' || rule.category === selectedCategory;
    const matchesSearch =
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.fullText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div className="bg-[#0d1c32] text-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#14b8a6]"></span>
            <span className="text-xs font-mono text-[#86f2e4] font-bold">CLINICAL GUIDELINE CITATION REPOSITORY</span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Evidence Library &amp; Regulatory Rules Trace
          </h2>
          <p className="text-xs text-[#76849f]">
            KDIGO 2023, ADA 2024, CPIC Level-A, and FDA Boxed Warning deterministic rule codifications.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guidelines by drug, rule code, condition, or keyword..."
            className="w-full pl-9 pr-3 py-2 rounded border border-[#cbd5e1] outline-none focus:border-[#006a61]"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#006a61] text-white'
                  : 'bg-[#f2f4f6] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => {
          const isFda = rule.category === 'FDA Black Box';
          const provId = getRuleProvenanceId(rule.id);

          return (
            <div
              key={rule.id}
              className={`rounded-xl border p-4 bg-white shadow-2xs flex flex-col justify-between space-y-3 ${
                isFda ? 'border-[#fecaca]' : 'border-[#e2e8f0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isFda ? 'bg-[#fee2e2] text-[#991b1b]' : 'bg-[#006a61]/10 text-[#006a61]'
                  }`}>
                    {rule.code}
                  </span>
                  <span className="text-[11px] text-[#64748b] font-medium">
                    {rule.organization} ({rule.year})
                  </span>
                </div>

                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#191c1e] mb-1">
                  {rule.title}
                </h3>
                <span className="inline-block text-[10px] font-bold text-[#065f46] bg-[#d1fae5] px-2 py-0.2 rounded mb-2">
                  {rule.strengthOfRecommendation}
                </span>

                <p className="text-xs text-[#44474d] leading-relaxed">
                  {rule.fullText}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex flex-wrap gap-1">
                  {rule.appliedConditions.map((cond, i) => (
                    <span key={i} className="text-[10px] bg-[#f2f4f6] text-[#475569] px-2 py-0.5 rounded">
                      {cond}
                    </span>
                  ))}
                </div>

                {onOpenProvenance && (
                  <button
                    onClick={() => onOpenProvenance(provId)}
                    className="text-[11px] font-semibold text-[#006a61] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Audit Provenance &amp; DOI</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
