import React, { useState, useEffect } from 'react';
import { PatientCase } from '../../types/clinical';

interface ClinicalSearchGroundingViewProps {
  activePatient?: PatientCase;
  initialQuery?: string;
  onOpenProvenance?: (id: string) => void;
  onLaunchTwin?: () => void;
}

interface GroundingChunk {
  title: string;
  url: string;
}

interface SearchResponse {
  query: string;
  answer: string;
  groundingChunks: GroundingChunk[];
  webSearchQueries: string[];
  timestamp: string;
  cached?: boolean;
}

export const ClinicalSearchGroundingView: React.FC<ClinicalSearchGroundingViewProps> = ({
  activePatient,
  initialQuery = '',
  onOpenProvenance,
  onLaunchTwin
}) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [includePatientContext, setIncludePatientContext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const QUICK_PROMPTS = [
    { label: 'KDIGO 2023 Metformin in CKD', q: 'Latest KDIGO 2023 clinical practice guidelines for Metformin dosing ceilings in CKD Stage 3b (eGFR 30-44)' },
    { label: 'CPIC Warfarin vs DOAC in CYP2C9 *3/*3', q: 'CPIC Level 1A guidelines for Warfarin dosing in CYP2C9 *3/*3 poor metabolizers and DOAC alternatives' },
    { label: 'FDA Citalopram Geriatric QTc Alert', q: 'FDA Drug Safety Communication on Citalopram 20mg maximum daily dose ceiling in patients over 60' },
    { label: 'SGLT2i Cardiorenal Protection in CKD', q: 'Recent EMPA-KIDNEY and DAPA-CKD trials for SGLT2 inhibitors down to eGFR 20' },
    { label: 'Donepezil Beers Criteria Warnings', q: '2023 AGS Beers Criteria recommendations on Donepezil syncope and bradycardia risk' },
    { label: 'Acetaminophen & Warfarin DDI', q: 'Mechanism and clinical evidence of Acetaminophen interaction with Warfarin INR elevation' }
  ];

  // Free, authoritative medical search engines
  const FREE_SEARCH_ENGINES = [
    {
      name: 'PubMed / NCBI',
      desc: 'Free 36M+ biomedical citations & abstracts (National Library of Medicine)',
      badge: 'Free Open',
      icon: 'menu_book',
      getUrl: (q: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`
    },
    {
      name: 'NIH DailyMed (FDA)',
      desc: 'Official FDA drug package inserts, boxed warnings & approved labels',
      badge: 'Official FDA',
      icon: 'description',
      getUrl: (q: string) => `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(q)}`
    },
    {
      name: 'MedlinePlus (NIH)',
      desc: 'Government-curated drug and condition monographs for clinicians and patients',
      badge: 'NIH Public',
      icon: 'health_and_safety',
      getUrl: (q: string) => `https://medlineplus.gov/search?query=${encodeURIComponent(q)}`
    },
    {
      name: 'Europe PMC',
      desc: 'Open-access life science articles, clinical trial records and preprints',
      badge: 'Open Access',
      icon: 'public',
      getUrl: (q: string) => `https://europepmc.org/search?query=${encodeURIComponent(q)}`
    },
    {
      name: 'UpToDate (Direct Search)',
      desc: 'Point-of-care clinical consensus topics and specialist reviews',
      badge: 'Consensus',
      icon: 'clinical_notes',
      getUrl: (q: string) => `https://www.uptodate.com/contents/search?search=${encodeURIComponent(q)}`
    },
    {
      name: 'Google Scholar',
      desc: 'Peer-reviewed clinical journals, pharmacology dissertations, and textbooks',
      badge: 'Academic',
      icon: 'school',
      getUrl: (q: string) => `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`
    }
  ];

  const handleExecuteSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: any = { query: searchQuery.trim() };
      if (includePatientContext && activePatient) {
        payload.patientContext = {
          id: activePatient.id,
          egfr: activePatient.organStatus.renal.egfr,
          scr: activePatient.organStatus.renal.scr,
          cypStatus: activePatient.organStatus.hepatic.cypStatus,
          medications: activePatient.medications.map(m => `${m.name} ${m.dose}`)
        };
      }

      const res = await fetch('/api/clinical-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Search request failed with status ${res.status}`);
      }

      const data: SearchResponse = await res.json();
      setSearchResponse(data);
    } catch (err: any) {
      console.error('Failed to search clinical evidence:', err);
      setErrorMessage(err.message || 'Unable to connect to clinical search grounding service. You can use the free medical search engine links below.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleExecuteSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleCopySummary = () => {
    if (!searchResponse) return;
    const textToCopy = `SYNTHOS CLINICAL INTELLIGENCE GROUNDING
Query: ${searchResponse.query}
Date: ${new Date(searchResponse.timestamp).toLocaleString()}

${searchResponse.answer}

Sources:
${searchResponse.groundingChunks.map((c) => `- ${c.title}: ${c.url}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopyStatus('Clinical synthesis copied to clipboard!');
    setTimeout(() => setCopyStatus(null), 3000);
  };

  const handleDownloadMarkdown = () => {
    if (!searchResponse) return;
    const md = `# SYNTHOS Clinical Evidence Dossier\n\n**Query:** ${searchResponse.query}\n**Date:** ${new Date(searchResponse.timestamp).toLocaleString()}\n\n---\n\n${searchResponse.answer}\n\n## Verified Literature Citations\n\n${searchResponse.groundingChunks.map(c => `- [${c.title}](${c.url})`).join('\n')}`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SYNTHOS_Evidence_${searchResponse.query.slice(0, 24).replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="bg-[#0f2b38] dark:bg-[#07131a] text-white rounded-2xl p-6 shadow-md border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-mono text-teal-300 font-bold uppercase tracking-wider text-[11px]">
              EVIDENCE GROUNDING ENGINE
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-300">Google Search Grounded</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-400">Strict Anti-Hallucination</span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight">
            Live Clinical Guidelines &amp; Evidence Search
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed">
            Clarify clinical pharmacotherapy questions across KDIGO, ADA, CPIC, and FDA.
            Synthesizes answers grounded directly in live medical literature with direct links to PubMed, DailyMed, and open-access repositories.
          </p>
        </div>

        {onLaunchTwin && (
          <button
            onClick={onLaunchTwin}
            className="px-4 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#E6F4F1]0 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Return to Digital Twin</span>
          </button>
        )}
      </div>

      {/* Main Search Input Stage */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch();
          }}
          className="space-y-3"
        >
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[24px]">
              travel_explore
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clinical guidelines, trial results, FDA alerts, or drug interactions..."
              className="w-full pl-12 pr-32 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-teal-700 dark:focus:border-teal-500 transition-colors shadow-inner"
            />
            <div className="absolute right-2 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                  title="Clear query"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  isLoading || !query.trim()
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-[#0F766E] hover:bg-[#0F766E] text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>
                  {isLoading ? 'refresh' : 'search'}
                </span>
                <span>{isLoading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Context and Toggles Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={includePatientContext}
                  onChange={(e) => setIncludePatientContext(e.target.checked)}
                  className="rounded text-[#0F766E] focus:ring-teal-700 w-4 h-4"
                />
                <span>Include Active Patient Biometrics &amp; Genotype</span>
              </label>

              {activePatient && includePatientContext && (
                <span className="text-[11px] font-mono text-[#0F766E] dark:text-teal-300">
                  {activePatient.id} · eGFR {activePatient.organStatus.renal.egfr} mL/min · {activePatient.organStatus.hepatic.cypStatus}
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Grounding: Google Search Grounding with Gemini
            </span>
          </div>
        </form>

        {/* Quick Prompts Carousel */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Clinical Fast-Tracer Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(p.q);
                  handleExecuteSearch(p.q);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer transition-colors text-left"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Copy notification */}
      {copyStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">check_circle</span>
            <span>{copyStatus}</span>
          </div>
        </div>
      )}

      {/* Free Medical Search Engines Direct Launch Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0F766E] dark:text-teal-400 text-[18px]">travel_explore</span>
              <span>Authoritative Biomedical Search Engines (Free · No Sign-in)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Open public databases with primary peer-reviewed papers and FDA package inserts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FREE_SEARCH_ENGINES.map((engine, idx) => {
            const currentSearchTarget = query.trim() || (activePatient ? `metformin ${activePatient.organStatus.renal.stage}` : 'pharmacotherapy');
            const targetUrl = engine.getUrl(currentSearchTarget);

            return (
              <a
                key={idx}
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-[#14B8A6] hover:shadow-xs transition-all flex flex-col justify-between group bg-slate-50/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 group-hover:text-[#0F766E] dark:group-hover:text-teal-300">
                      <span className="material-symbols-outlined text-[17px] text-[#0F766E] dark:text-teal-400">{engine.icon}</span>
                      <span>{engine.name}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {engine.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {engine.desc}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[11px] font-semibold text-[#0F766E] dark:text-teal-400">
                  <span>Open search in new tab</span>
                  <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
                    open_in_new
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 shadow-2xs transition-colors">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Querying Google Search Grounded Clinical Evidence...</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Scanning PubMed citations, KDIGO clinical practice guidelines, CPIC pharmacogenomic levels, and FDA drug labeling.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="material-symbols-outlined text-amber-700 dark:text-amber-400 text-[20px]">info</span>
            <span>Clinical Search Notice</span>
          </div>
          <p className="leading-relaxed">
            {errorMessage}
          </p>
          <div className="pt-1 text-[11px] text-amber-800 dark:text-amber-300">
            Tip: You can click any of the <strong>Free Medical Search Engines</strong> above (PubMed, DailyMed, Europe PMC) to immediately view live results.
          </div>
        </div>
      )}

      {/* Search Grounding Response Display */}
      {searchResponse && !isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-5 animate-fade-in transition-colors">
          {/* Response Title & Executed Queries */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#0F766E] dark:text-teal-400 font-bold uppercase tracking-wider">
                <span>Grounded Clinical Synthesis</span>
                {searchResponse.cached && <span>· Cached (Fast-Trace)</span>}
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-slate-100">
                "{searchResponse.query}"
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy formatted summary to clipboard"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copy Summary</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="Export as Markdown Dossier"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Dossier</span>
              </button>
            </div>
          </div>

          {/* Executed Web Search Queries */}
          {searchResponse.webSearchQueries.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Google Search Queries Executed:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {searchResponse.webSearchQueries.map((wq, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-600">
                    "{wq}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synthesized Answer */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap">
            {searchResponse.answer}
          </div>

          {/* Verified Web Citations & Sources */}
          {searchResponse.groundingChunks.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-bold text-xs">
                <span className="material-symbols-outlined text-[#0F766E] dark:text-teal-400 text-[18px]">verified</span>
                <span>Verified Evidence Sources &amp; Literature Citations ({searchResponse.groundingChunks.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {searchResponse.groundingChunks.map((chunk, idx) => {
                  let hostname = '';
                  try {
                    hostname = new URL(chunk.url).hostname.replace(/^www\./, '');
                  } catch {
                    hostname = 'web source';
                  }

                  return (
                    <a
                      key={idx}
                      href={chunk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-[#14B8A6] hover:shadow-2xs transition-all flex items-start justify-between gap-2 group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block truncate group-hover:text-[#0F766E] dark:group-hover:text-teal-300">
                          {chunk.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#0F766E] dark:text-teal-400 block truncate">
                          {hostname}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-[#14B8A6] text-[16px] shrink-0 mt-0.5">
                        open_in_new
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
