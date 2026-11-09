import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RenalMathModal } from './components/RenalMathModal';
import { SearchModal } from './components/SearchModal';
import { SimulationModal } from './components/SimulationModal';
import { NewAssessmentModal } from './components/NewAssessmentModal';
import { ProvenanceDrawer } from './components/ProvenanceDrawer';
import { VideoIntroModal } from './components/video/VideoIntroModal';
import { ClinicianAuthModal } from './components/modals/ClinicianAuthModal';
import { DisclaimerModal } from './components/modals/DisclaimerModal';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { SessionHistoryDrawer } from './components/modals/SessionHistoryDrawer';

import { PublicHomeView } from './components/views/PublicHomeView';
import { DigitalTwinSimulationView } from './components/views/DigitalTwinSimulationView';
import { PathwayExplorerView } from './components/views/PathwayExplorerView';
import { DrugIntelligenceView } from './components/views/DrugIntelligenceView';
import { MethodologyLimitationsView } from './components/views/MethodologyLimitationsView';
import { OverviewView } from './components/views/OverviewView';
import { PatientTwinView } from './components/views/PatientTwinView';
import { MedicationReviewView } from './components/views/MedicationReviewView';
import { InteractionCheckerView } from './components/views/InteractionCheckerView';
import { ClinicalScenariosView } from './components/views/ClinicalScenariosView';
import { MonitoringPlanView } from './components/views/MonitoringPlanView';
import { EvidenceLibraryView } from './components/views/EvidenceLibraryView';
import { ReportsView } from './components/views/ReportsView';
import { AboutLimitationsView } from './components/views/AboutLimitationsView';
import { GenomicScannerView } from './components/views/GenomicScannerView';
import { FhirIntegrationView } from './components/views/FhirIntegrationView';
import { SimulationVaultView } from './components/views/SimulationVaultView';
import { ClinicalSearchGroundingView } from './components/views/ClinicalSearchGroundingView';
import { GuidedSimulationWizard } from './components/views/GuidedSimulationWizard';
import { PersonalizeRegimenModal } from './components/modals/PersonalizeRegimenModal';
import { PersonalizedCasesModal } from './components/modals/PersonalizedCasesModal';

import { PATIENT_CASES } from './data/patientCases';
import { PatientCase } from './types/clinical';
import { AuthProvider, useClinicianAuth } from './context/AuthContext';
import { AnonymousCaseRecord } from './firebase';
import { ThemeProvider } from './context/ThemeContext';
import { exportPatientTwinToPdf } from './utils/clinicalPdfExport';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [patientRegistry, setPatientRegistry] = useState<Record<string, PatientCase>>(PATIENT_CASES);
  const [activePatientId, setActivePatientId] = useState<string>('DEMO-PT-0241');

  // Modals & Drawers state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isRenalMathOpen, setIsRenalMathOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState<boolean>(false);
  const [isVideoIntroOpen, setIsVideoIntroOpen] = useState<boolean>(false);
  const [isPersonalizeRegimenOpen, setIsPersonalizeRegimenOpen] = useState<boolean>(false);
  const [isAdminDatabaseOpen, setIsAdminDatabaseOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSessionHistoryOpen, setIsSessionHistoryOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeProvenanceId, setActiveProvenanceId] = useState<string | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');

  // Authentication hook
  const { requireAuthForAction, clinician, openAuthModal, saveCaseRecord, openPersonalizedModal } = useClinicianAuth();

  const activePatient = patientRegistry[activePatientId] || PATIENT_CASES['DEMO-PT-0241'];

  // Global ⌘K, ⌘/, numbers, and admin ⌘⇧D shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // ⌘/ Keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      // ⌘⇧D Admin Database Vault
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsAdminDatabaseOpen((prev) => !prev);
      }
      // ⌘1 - ⌘4 Tab Switching
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        if (e.key === '1') {
          e.preventDefault();
          setCurrentTab('overview');
        } else if (e.key === '2') {
          e.preventDefault();
          setCurrentTab('digital-twin');
        } else if (e.key === '3') {
          e.preventDefault();
          setCurrentTab('drug-explorer');
        } else if (e.key === '4') {
          e.preventDefault();
          setCurrentTab('clinical-search');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check URL query parameters for admin database tracker (?admin=db)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'db' || params.get('database') === '1') {
        setIsAdminDatabaseOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectPatient = (id: string) => {
    if (patientRegistry[id]) {
      setActivePatientId(id);
    }
  };

  const handleApplySimulation = (updatedPatient: PatientCase) => {
    setPatientRegistry((prev) => ({
      ...prev,
      [updatedPatient.id]: updatedPatient
    }));
  };

  const handleSaveAssessment = (newCase: PatientCase) => {
    setPatientRegistry((prev) => ({
      ...prev,
      [newCase.id]: newCase
    }));
    setActivePatientId(newCase.id);
    setCurrentTab('digital-twin');
  };

  const handleApplyGenomicProfile = (profile: { gene: string; diplotype: string; phenotype: string }) => {
    setPatientRegistry((prev) => {
      const current = prev[activePatientId];
      if (!current) return prev;
      return {
        ...prev,
        [activePatientId]: {
          ...current,
          organStatus: {
            ...current.organStatus,
            hepatic: {
              ...current.organStatus.hepatic,
              cypStatus: `${profile.gene} ${profile.diplotype} ${profile.phenotype}`
            }
          }
        }
      };
    });
  };

  const handleImportPatientFromFhir = (importedCase: PatientCase) => {
    setPatientRegistry((prev) => ({
      ...prev,
      [importedCase.id]: importedCase
    }));
    setActivePatientId(importedCase.id);
    setCurrentTab('digital-twin');
  };

  const handleApplyPersonalizedRegimen = (updatedPatient: PatientCase) => {
    setPatientRegistry((prev) => ({
      ...prev,
      [updatedPatient.id]: updatedPatient
    }));
  };

  const handleOpenSearchWithQuery = (query: string) => {
    setSearchInitialQuery(query);
    setCurrentTab('clinical-search');
  };

  const handleUpdateActivePatientLabs = (updatedLabs: { scr?: number; egfr?: number; crcl?: number; potassium?: number; inr?: number }) => {
    setPatientRegistry((prev) => {
      const current = prev[activePatientId];
      if (!current) return prev;
      return {
        ...prev,
        [activePatientId]: {
          ...current,
          organStatus: {
            ...current.organStatus,
            renal: {
              ...current.organStatus.renal,
              ...(updatedLabs.scr !== undefined ? { scr: updatedLabs.scr } : {}),
              ...(updatedLabs.egfr !== undefined ? { egfr: updatedLabs.egfr } : {}),
              ...(updatedLabs.crcl !== undefined ? { crcl: updatedLabs.crcl } : {})
            },
            cardiovascular: {
              ...current.organStatus.cardiovascular,
              ...(updatedLabs.potassium !== undefined ? { potassium: updatedLabs.potassium } : {})
            }
          }
        }
      };
    });
  };

  // Require clinician sign in before creating custom patient assessments
  const handleOpenNewAssessment = () => {
    requireAuthForAction(() => {
      setIsNewAssessmentOpen(true);
    });
  };

  // Structured PDF Export for current patient digital twin
  const handleExportPdf = () => {
    exportPatientTwinToPdf(activePatient, {
      clinicianName: clinician?.name,
      clinicianCredentials: clinician?.credentials,
      institution: clinician?.institution
    });
  };

  const handleLoadSavedCaseIntoTwin = (savedCase: AnonymousCaseRecord) => {
    const baseline = PATIENT_CASES['DEMO-PT-0241'];
    const customCaseId = savedCase.anonymousCaseId || `SAVED-${Date.now().toString().slice(-4)}`;
    const restoredCase: PatientCase = {
      ...baseline,
      id: customCaseId,
      nameAlias: `Patient Twin (${savedCase.anonymousCaseId})`,
      summary: `Personalized digital twin loaded from cloud vault. ${savedCase.demographicDecade} ${savedCase.biologicalSex}.`,
      biometrics: {
        ...baseline.biometrics,
        age: savedCase.inputs.age,
        sex: (savedCase.biologicalSex as any) === 'Female' ? 'Female' : 'Male',
        weightKg: savedCase.inputs.weightKg,
        heightCm: savedCase.inputs.heightCm || 175,
        bmi: Math.round((savedCase.inputs.weightKg / Math.pow((savedCase.inputs.heightCm || 175) / 100, 2)) * 10) / 10
      },
      organStatus: {
        ...baseline.organStatus,
        renal: {
          ...baseline.organStatus.renal,
          scr: savedCase.inputs.scr,
          egfr: savedCase.outputs.egfr,
          crcl: savedCase.outputs.crcl,
          status: savedCase.outputs.egfr < 30 ? 'compromised' : savedCase.outputs.egfr < 60 ? 'caution' : 'normal',
          stage: savedCase.outputs.egfr < 15 ? 'Stage 5' : savedCase.outputs.egfr < 30 ? 'Stage 4' : savedCase.outputs.egfr < 60 ? 'Stage 3' : 'Stage 1-2'
        },
        hepatic: {
          ...baseline.organStatus.hepatic,
          cypStatus: savedCase.inputs.cypGenotype || baseline.organStatus.hepatic.cypStatus
        },
        cardiovascular: {
          ...baseline.organStatus.cardiovascular,
          potassium: savedCase.inputs.potassium || baseline.organStatus.cardiovascular.potassium
        }
      }
    };

    setPatientRegistry((prev) => ({
      ...prev,
      [customCaseId]: restoredCase
    }));
    setActivePatientId(customCaseId);
    setCurrentTab('digital-twin');
  };

  const handleSaveCurrentActiveTwin = async (title?: string) => {
    const anonCaseId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
    const firstMed = activePatient.medications[0];
    await saveCaseRecord({
      anonymousCaseId: anonCaseId,
      demographicDecade: `${Math.floor(activePatient.biometrics.age / 10) * 10}-${Math.floor(activePatient.biometrics.age / 10) * 10 + 9} Y`,
      biologicalSex: activePatient.biometrics.sex,
      inputs: {
        age: activePatient.biometrics.age,
        weightKg: activePatient.biometrics.weightKg,
        heightCm: activePatient.biometrics.heightCm,
        scr: activePatient.organStatus.renal.scr,
        potassium: activePatient.organStatus.cardiovascular.potassium || 4.2,
        cypGenotype: activePatient.organStatus.hepatic.cypStatus,
        selectedDrug: firstMed?.name || 'Enoxaparin',
        doseMg: parseFloat(firstMed?.dose || '40') || 40,
        intervalHours: 12
      },
      outputs: {
        egfr: activePatient.organStatus.renal.egfr,
        crcl: activePatient.organStatus.renal.crcl,
        simulatedHalfLife: 7.2,
        halfLifeChangeFactor: 1.0,
        predictedPeakCss: 1.2,
        upperSafetyCeiling: 2.0,
        safetyCeilingExceeded: false,
        primarySafetyFinding: 'Personalized clinical regimen snapshot'
      },
      clinicianNotes: title || `Patient ${activePatient.id} snapshot`
    });
  };

  // Dedicated full-bleed Public Homepage
  if (currentTab === 'home') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#1E3A5F] font-sans antialiased">
        <PublicHomeView
          onLaunchTwin={() => setCurrentTab('guided-wizard')}
          onOpenPathways={() => setCurrentTab('pathway-network')}
          onOpenDrugIntelligence={() => setCurrentTab('drug-explorer')}
          onOpenEvidence={() => setCurrentTab('methodology')}
          onOpenVideoIntro={() => setIsVideoIntroOpen(true)}
          onOpenAuth={() => openAuthModal()}
        />

        {/* Video Tour Modal */}
        <VideoIntroModal
          isOpen={isVideoIntroOpen}
          onClose={() => setIsVideoIntroOpen(false)}
          onLaunchTwin={() => setCurrentTab('digital-twin')}
          onOpenDrugIntelligence={() => setCurrentTab('drug-explorer')}
        />

        {/* Global Provenance Drawer */}
        <ProvenanceDrawer
          provenanceId={activeProvenanceId}
          onClose={() => setActiveProvenanceId(null)}
        />

        {/* Clinician Authentication Modal */}
        <ClinicianAuthModal />

        {/* Personalized Cases & Workspace Modal */}
        <PersonalizedCasesModal
          onLoadCaseIntoTwin={handleLoadSavedCaseIntoTwin}
          onSaveCurrentTwin={handleSaveCurrentActiveTwin}
          activePatientName={activePatient.nameAlias || activePatient.id}
        />

        {/* Clinical Disclaimer Acceptance Modal */}
        <DisclaimerModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A5F] dark:text-[#D8E2ED] font-sans antialiased transition-colors">
      {/* Responsive Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activePatient={activePatient}
        onOpenVideoIntro={() => setIsVideoIntroOpen(true)}
        onOpenPersonalizeRegimen={() => setIsPersonalizeRegimenOpen(true)}
        onOpenAdminDatabase={() => setIsAdminDatabaseOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Container */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-screen bg-[#FAF7F2] dark:bg-[#0D1926] transition-colors">
        {/* Fixed Header */}
        <Header
          activePatient={activePatient}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenPatientSelect={() => setCurrentTab('clinical-scenarios')}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenNewAssessment={handleOpenNewAssessment}
          onReturnToHome={() => setCurrentTab('home')}
          onOpenGuidedWizard={() => setCurrentTab('guided-wizard')}
          onOpenVideoIntro={() => setIsVideoIntroOpen(true)}
          onExportPdf={handleExportPdf}
          onOpenPersonalizeRegimen={() => setIsPersonalizeRegimenOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 pt-20 pb-14 w-full px-4 sm:px-6 bg-[#FAF7F2] dark:bg-[#0D1926] overflow-y-auto transition-colors">
          {currentTab === 'guided-wizard' && (
            <GuidedSimulationWizard
              onSwitchToWorkstation={() => setCurrentTab('digital-twin')}
              onOpenAdminDatabase={() => setIsAdminDatabaseOpen(true)}
            />
          )}

          {(currentTab === 'twin' || currentTab === 'digital-twin' || currentTab === 'patient-twin') && (
            <DigitalTwinSimulationView
              patient={activePatient}
              onOpenRenalMath={() => setIsRenalMathOpen(true)}
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
              onOpenSessionHistory={() => setIsSessionHistoryOpen(true)}
            />
          )}

          {(currentTab === 'drug-intelligence' || currentTab === 'drug-explorer') && (
            <DrugIntelligenceView
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
              onLaunchTwin={() => setCurrentTab('digital-twin')}
            />
          )}

          {(currentTab === 'pathways' || currentTab === 'pathway-network') && (
            <PathwayExplorerView
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
              onLaunchTwin={() => setCurrentTab('digital-twin')}
            />
          )}

          {(currentTab === 'limitations' || currentTab === 'methodology') && (
            <MethodologyLimitationsView
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
            />
          )}

          {currentTab === 'about' && (
            <AboutLimitationsView />
          )}

          {currentTab === 'overview' && (
            <OverviewView
              patient={activePatient}
              onSelectPatient={handleSelectPatient}
              onOpenRenalMath={() => setIsRenalMathOpen(true)}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onOpenNewAssessment={handleOpenNewAssessment}
              onNavigateTab={setCurrentTab}
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
              onExportPdf={handleExportPdf}
              onOpenPersonalizeRegimen={() => setIsPersonalizeRegimenOpen(true)}
            />
          )}

          {(currentTab === 'medications' || currentTab === 'medication-review') && (
            <MedicationReviewView
              patient={activePatient}
              onOpenRenalMath={() => setIsRenalMathOpen(true)}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
              onOpenPersonalizeRegimen={() => setIsPersonalizeRegimenOpen(true)}
            />
          )}

          {(currentTab === 'interactions' || currentTab === 'interaction-checker') && (
            <InteractionCheckerView patient={activePatient} />
          )}

          {(currentTab === 'genomics' || currentTab === 'genomic-scanner') && (
            <GenomicScannerView
              activePatient={activePatient}
              onApplyGenomicProfile={handleApplyGenomicProfile}
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
            />
          )}

          {(currentTab === 'fhir' || currentTab === 'fhir-integration') && (
            <FhirIntegrationView
              activePatient={activePatient}
              onImportPatientFromFhir={handleImportPatientFromFhir}
            />
          )}

          {(currentTab === 'scenarios' || currentTab === 'clinical-scenarios') && (
            <ClinicalScenariosView
              activePatient={activePatient}
              onSelectPatient={handleSelectPatient}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {(currentTab === 'monitoring' || currentTab === 'monitoring-plan') && (
            <MonitoringPlanView patient={activePatient} />
          )}

          {(currentTab === 'evidence' || currentTab === 'evidence-library') && (
            <EvidenceLibraryView
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
            />
          )}

          {(currentTab === 'search-grounding' || currentTab === 'clinical-search') && (
            <ClinicalSearchGroundingView
              activePatient={activePatient}
              initialQuery={searchInitialQuery}
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
              onLaunchTwin={() => setCurrentTab('digital-twin')}
            />
          )}

          {(currentTab === 'vault' || currentTab === 'simulation-vault') && (
            <SimulationVaultView
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
              onLaunchTwin={() => setCurrentTab('digital-twin')}
              onOpenPersonalizeRegimen={() => setIsPersonalizeRegimenOpen(true)}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              patient={activePatient}
              onOpenProvenance={(id) => setActiveProvenanceId(id)}
              onOpenSearch={handleOpenSearchWithQuery}
              onOpenPersonalizeRegimen={() => setIsPersonalizeRegimenOpen(true)}
              onUpdatePatientLab={handleUpdateActivePatientLabs}
            />
          )}
        </main>

        {/* Fixed Footer Bar */}
        <Footer onOpenAdminDatabase={() => setIsAdminDatabaseOpen(true)} />
      </div>

      {/* Modals & Drawers */}
      <ProvenanceDrawer
        provenanceId={activeProvenanceId}
        onClose={() => setActiveProvenanceId(null)}
      />

      <RenalMathModal
        patient={activePatient}
        isOpen={isRenalMathOpen}
        onClose={() => setIsRenalMathOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPatient={handleSelectPatient}
        onNavigateTab={setCurrentTab}
      />

      <SimulationModal
        patient={activePatient}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onApplySimulation={handleApplySimulation}
      />

      <PersonalizeRegimenModal
        patient={activePatient}
        isOpen={isPersonalizeRegimenOpen}
        onClose={() => setIsPersonalizeRegimenOpen(false)}
        onApplyRegimen={handleApplyPersonalizedRegimen}
      />

      <NewAssessmentModal
        isOpen={isNewAssessmentOpen}
        onClose={() => setIsNewAssessmentOpen(false)}
        onSaveAssessment={handleSaveAssessment}
      />

      {/* Private Admin Simulation Telemetry Database Tracker Modal */}
      {isAdminDatabaseOpen && (
        <div className="fixed inset-0 z-50 bg-[#0D1926]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#FAF7F2] dark:bg-[#0D1926] w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] overflow-hidden flex flex-col animate-scale-in">
            {/* Header */}
            <div className="bg-[#1E3A8A] px-6 py-4 border-b border-[#0F2F57] flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#34D399]">
                  <span className="material-symbols-outlined text-[20px]">database</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-sm tracking-tight">
                      Simulation Telemetry Database Tracker
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#15803D] text-white border border-[#CBE4CB]/40 font-bold">
                      Owner &amp; Admin Private Store
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100">
                    Confidential audit log of simulations and titrations provided by users. Zero names/PHI stored (HIPAA Safe Harbor).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  Press ESC or ⌘⇧D to close
                </span>
                <button
                  onClick={() => setIsAdminDatabaseOpen(false)}
                  type="button"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Database Tracker"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <SimulationVaultView
                onOpenProvenance={(id) => {
                  setIsAdminDatabaseOpen(false);
                  setActiveProvenanceId(id);
                }}
                onLaunchTwin={() => {
                  setIsAdminDatabaseOpen(false);
                  setCurrentTab('digital-twin');
                }}
                onOpenPersonalizeRegimen={() => {
                  setIsAdminDatabaseOpen(false);
                  setIsPersonalizeRegimenOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ClinicianAuthModal />
      <PersonalizedCasesModal
        onLoadCaseIntoTwin={handleLoadSavedCaseIntoTwin}
        onSaveCurrentTwin={handleSaveCurrentActiveTwin}
        activePatientName={activePatient.nameAlias || activePatient.id}
      />
      <DisclaimerModal />

      {/* Video Tour Modal */}
      <VideoIntroModal
        isOpen={isVideoIntroOpen}
        onClose={() => setIsVideoIntroOpen(false)}
        onLaunchTwin={() => setCurrentTab('digital-twin')}
        onOpenDrugIntelligence={() => setCurrentTab('drug-explorer')}
      />

      {/* Keyboard Shortcuts Overlay Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Recent Simulation Session History Drawer */}
      <SessionHistoryDrawer
        isOpen={isSessionHistoryOpen}
        onClose={() => setIsSessionHistoryOpen(false)}
        onLoadRecordIntoTwin={() => {
          setCurrentTab('digital-twin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
