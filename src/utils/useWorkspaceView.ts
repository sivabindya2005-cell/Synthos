import { useCallback, useEffect, useRef, useState } from 'react';

const views = new Set([
  'saved-run', 'resume-run', 'care-handoff', 'home', 'guided-wizard', 'overview', 'digital-twin', 'twin', 'patient-twin',
  'drug-explorer', 'drug-intelligence', 'pathways', 'pathway-network',
  'methodology', 'limitations', 'about', 'medications', 'medication-review',
  'interactions', 'interaction-checker', 'genomics', 'genomic-scanner',
  'fhir', 'fhir-integration', 'scenarios', 'clinical-scenarios', 'monitoring',
  'monitoring-plan', 'evidence', 'evidence-library', 'search-grounding',
  'clinical-search', 'vault', 'simulation-vault', 'reports'
]);

function viewFromLocation() {
  const value = new URLSearchParams(window.location.search).get('view');
  return value && views.has(value) ? value : 'home';
}

export function useWorkspaceView() {
  const [view, setView] = useState(viewFromLocation);

  useEffect(() => {
    const restore = () => setView(viewFromLocation());
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  const previous = useRef(view);
  useEffect(() => {
    if (view !== previous.current) {
      previous.current = view;
      document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
    }
  }, [view]);

  const navigate = useCallback((next: string) => {
    if (!views.has(next) || next === viewFromLocation()) return;
    const url = new URL(window.location.href);
    if (next === 'home') url.searchParams.delete('view');
    else url.searchParams.set('view', next);
    url.hash = '';
    window.history.pushState(null, '', url);
    setView(next);
    window.scrollTo(0, 0);
  }, []);
  return [view, navigate] as const;
}
