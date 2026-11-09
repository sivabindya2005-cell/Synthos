import React, { useState } from 'react';
import { VideoIntroHeroCard } from '../video/VideoIntroHeroCard';
import { SynthosLogo } from '../common/SynthosLogo';
import { useClinicianAuth } from '../../context/AuthContext';

interface PublicHomeViewProps {
  onLaunchTwin: () => void;
  onOpenPathways: () => void;
  onOpenDrugIntelligence: () => void;
  onOpenEvidence: () => void;
  onOpenVideoIntro: () => void;
  onOpenAuth?: () => void;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({
  onLaunchTwin,
  onOpenPathways,
  onOpenDrugIntelligence,
  onOpenEvidence,
  onOpenVideoIntro,
  onOpenAuth
}) => {
  const { isAuthenticated, clinician, openAuthModal, openPersonalizedModal, savedCases } = useClinicianAuth();
  const [interactiveEgfr, setInteractiveEgfr] = useState<number>(42);

  // Quick illustrative calculation for homepage interactive teaser
  const halfLifeHours = Number((6.2 * (90 / Math.max(15, interactiveEgfr))).toFixed(1));
  const peakCss = Number((1.8 * (60 / Math.max(15, interactiveEgfr))).toFixed(2));
  const isDanger = interactiveEgfr < 30;
  const isCaution = interactiveEgfr >= 30 && interactiveEgfr <= 44;

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A5F] dark:text-slate-300 font-sans">
      {/* 3-Zone Clean Top Bar Matching Reference */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#07111E]/90 backdrop-blur-md border-b border-[#E5DDD0]/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Official SYNTHOS Logo + Clean Tracking Name */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-left shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
            title="SYNTHOS — Where Biology Meets Its Other Self."
          >
            <SynthosLogo
              size="md"
              variant="horizontal"
              theme="auto"
              showTagline={false}
            />
          </button>

          {/* Zone 2: 5 single-line clean text links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#1E3A5F] dark:text-slate-300">
            <a href="#pipeline" className="hover:text-[#0284c7] transition-colors whitespace-nowrap">
              Architecture
            </a>
            <a href="#why-individuality" className="hover:text-[#0284c7] transition-colors whitespace-nowrap">
              Why Individuality?
            </a>
            <button onClick={onOpenPathways} className="hover:text-[#0284c7] transition-colors whitespace-nowrap cursor-pointer">
              Pathway Explorer
            </button>
            <button onClick={onOpenDrugIntelligence} className="hover:text-[#0284c7] transition-colors whitespace-nowrap cursor-pointer">
              Drug Intelligence
            </button>
            <a href="#limitations" className="hover:text-[#0284c7] transition-colors whitespace-nowrap">
              Scientific Boundaries
            </a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenVideoIntro}
              className="px-4 py-2 text-xs font-semibold text-[#1E3A5F] dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-full hover:bg-white transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-2xs hover:scale-[1.02]"
              title="Watch 65s Video Overview"
            >
              <span className="material-symbols-outlined text-[16px] text-cyan-500">play_circle</span>
              <span className="hidden sm:inline">Video Intro</span>
            </button>

            {isAuthenticated && clinician ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openPersonalizedModal()}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02]"
                  title={`Personalized Workspace (${savedCases.length} saved cases)`}
                >
                  <span className="material-symbols-outlined text-[15px]">folder_special</span>
                  <span className="hidden sm:inline">My Cases</span>
                  {savedCases.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-600 text-white font-mono font-bold">
                      {savedCases.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => (onOpenAuth ? onOpenAuth() : openAuthModal())}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0B1528] dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 border border-teal-500/40 rounded-full hover:bg-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02]"
                  title={`Signed in as @${clinician.username || clinician.name}`}
                >
                  <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px] font-bold">
                    {clinician.name ? clinician.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="hidden md:inline font-mono text-[11px] font-bold">@{clinician.username || clinician.name}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => (onOpenAuth ? onOpenAuth() : openAuthModal())}
                className="px-3.5 py-2 text-xs font-semibold text-[#1E3A5F] dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-full hover:bg-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02]"
                title="Clinician Sign-In & Verification"
              >
                <span className="material-symbols-outlined text-[15px] text-[#15803D] dark:text-teal-400">lock</span>
                <span>Sign In / Register</span>
              </button>
            )}

            <button
              onClick={onLaunchTwin}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B1528] hover:bg-[#050B16] border border-cyan-400/40 rounded-full transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_22px_rgba(6,182,212,0.55)] whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Digital Twin</span>
              <span className="material-symbols-outlined text-[15px] text-cyan-400">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Cinematic Hero Stage (Matches Reference Mockup) */}
      <section className="relative min-h-[92vh] sm:min-h-[94vh] flex flex-col justify-between overflow-hidden bg-[#FAF7F2] dark:bg-[#07111E] border-b border-[#E5DDD0] dark:border-slate-800">
        {/* Full-Bleed Artwork Backdrop */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src="/assets/aistudio/Untitled_design__2__af2040b1.png"
            alt="SYNTHOS Biological Human and Digital Twin Split Artwork"
            className="w-full h-full object-cover object-center lg:object-right opacity-95 transition-opacity"
          />
          {/* Subtle responsive gradient overlay to ensure text contrast and legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/95 via-[#FAF7F2]/65 to-transparent dark:from-[#07111E]/95 dark:via-[#07111E]/65 dark:to-transparent lg:w-3/5"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAF7F2] dark:from-[#07111E] to-transparent"></div>
        </div>

        {/* Hero Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full relative z-10 flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              {/* Precision Platform Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-[#CBE4CB] dark:border-cyan-500/30 text-[11px] font-bold text-[#15803D] dark:text-cyan-300 font-mono tracking-wider uppercase shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#15803D] dark:bg-cyan-400 animate-pulse"></span>
                <span>Precision Medicine &amp; Computational Pharmacology Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-['Plus_Jakarta_Sans'] text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-[#0B1528] dark:text-[#F8FAFC] tracking-tight leading-[1.08] text-balance">
                SYNTHOS —<br />
                Where Biology<br />
                Meets Its <span className="italic font-serif font-semibold text-[#0284c7] dark:text-[#38bdf8]">Other Self.</span>
              </h1>

              {/* Description Paragraph */}
              <p className="text-sm sm:text-base text-[#1E3A5F] dark:text-slate-300 max-w-lg leading-relaxed font-normal">
                Explore how individual biological characteristics, clinical laboratory parameters, and pharmaceutical science unite into an interactive digital twin simulation.
              </p>

              {/* Primary Dual CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onLaunchTwin}
                  className="px-7 py-3.5 rounded-full bg-[#0B1528] hover:bg-[#050B16] text-white text-sm font-bold shadow-[0_0_28px_rgba(20,184,166,0.45)] hover:shadow-[0_0_35px_rgba(20,184,166,0.65)] ring-1 ring-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <span>Launch Patient Digital Twin</span>
                  <span className="material-symbols-outlined text-[18px] text-cyan-400">arrow_forward</span>
                </button>

                <button
                  onClick={onOpenVideoIntro}
                  className="px-5 py-3.5 rounded-full bg-white/70 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 text-[#1E3A5F] dark:text-slate-200 text-sm font-semibold transition-all flex items-center gap-2.5 cursor-pointer shadow-xs hover:scale-[1.02]"
                >
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  </span>
                  <span>Watch Overview</span>
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Frosted Glass Telemetry Cards */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-end gap-6 pt-4 lg:pt-0">
              {/* Card 1: Patient Digital Twin Card */}
              <div className="w-full max-w-sm rounded-2xl p-4 bg-slate-900/50 dark:bg-slate-950/60 backdrop-blur-xl border border-cyan-400/30 shadow-[0_8px_32px_rgba(2,6,23,0.45)] text-white space-y-3 transition-transform hover:scale-[1.01]">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm tracking-tight text-white">
                      Patient Digital Twin
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/30">
                    Live Telemetry
                  </span>
                </div>

                {/* Animated Real-time ECG Waveform */}
                <div className="h-9 w-full bg-slate-950/60 rounded-lg p-1.5 border border-cyan-500/20 flex items-center overflow-hidden">
                  <svg className="w-full h-full text-cyan-400" viewBox="0 0 240 30" fill="none">
                    <path
                      d="M0,15 L40,15 L45,15 L50,6 L55,24 L60,8 L65,18 L70,15 L120,15 L125,15 L130,6 L135,24 L140,8 L145,18 L150,15 L240,15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* 4 Interactive Telemetry Nodes + Wireframe Silhouette */}
                <div className="grid grid-cols-12 gap-3 items-center pt-1">
                  <div className="col-span-8 space-y-1.5 text-xs font-mono">
                    {[
                      { key: 'genomics', label: 'Genomics', val: 'CYP2C19 *2/*3 PM', icon: 'dna' },
                      { key: 'biomarkers', label: 'Biomarkers', val: 'eGFR 42 mL/min', icon: 'vital_signs' },
                      { key: 'clinical', label: 'Clinical Data', val: 'SCr 1.6 • K+ 4.8', icon: 'medical_information' },
                      { key: 'prediction', label: 'Response Prediction', val: 'Peak 2.1 mcg/mL', icon: 'timeline' }
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-cyan-500/20 flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          <span className="text-[11px] text-slate-300 font-sans font-medium">{item.label}</span>
                        </div>
                        <span className="text-[10px] text-cyan-300 font-bold font-mono group-hover:text-cyan-200">
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Wireframe Silhouette Anatomy Icon */}
                  <div className="col-span-4 flex flex-col items-center justify-center p-2 rounded-xl bg-cyan-950/40 border border-cyan-400/20 text-cyan-300">
                    <span className="material-symbols-outlined text-[42px] animate-pulse">
                      accessibility_new
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400 mt-1 uppercase">Twin Mesh</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Therapeutic Insights Card */}
              <div className="w-full max-w-[320px] rounded-2xl p-4 bg-slate-900/50 dark:bg-slate-950/60 backdrop-blur-xl border border-cyan-400/30 shadow-[0_8px_32px_rgba(2,6,23,0.45)] text-white space-y-2.5 transition-transform hover:scale-[1.01]">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs tracking-tight text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-cyan-400">medication</span>
                    Therapeutic Insights
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">Metformin 1000mg</span>
                </div>

                {/* Capsule Pill & Pharmacokinetic Sigmoidal Curve */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">pill</span>
                  </div>
                  <div className="flex-1 h-12 bg-slate-950/60 rounded-lg p-1.5 border border-cyan-500/20 relative overflow-hidden flex items-center">
                    <svg className="w-full h-full text-cyan-400" viewBox="0 0 160 40" fill="none">
                      <path
                        d="M 5,35 C 45,35 65,8 140,6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="140" cy="6" r="3.5" fill="#38bdf8" className="animate-ping" />
                      <circle cx="140" cy="6" r="2.5" fill="#ffffff" />
                    </svg>
                    <span className="absolute right-2 bottom-1 text-[9px] font-mono text-cyan-300 font-bold">
                      Css Peak 2.1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Floating Capsule Dock (4 Pillars from Reference) */}
          <div className="pt-8 pb-4">
            <div className="max-w-4xl mx-auto rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-300/80 dark:border-cyan-500/30 p-2.5 sm:p-3 shadow-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
                <div className="flex items-center gap-2.5 p-2 justify-center">
                  <span className="material-symbols-outlined text-[20px] text-cyan-500 dark:text-cyan-400">dna</span>
                  <div>
                    <span className="font-bold text-[#0B1528] dark:text-white block leading-tight">Instant Live</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Execution</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 justify-center">
                  <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400">hub</span>
                  <div>
                    <span className="font-bold text-[#0B1528] dark:text-white block leading-tight">No Sign-in</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Required</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 justify-center">
                  <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">verified_user</span>
                  <div>
                    <span className="font-bold text-[#0B1528] dark:text-white block leading-tight">De-identified &amp;</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Confidential</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 justify-center">
                  <span className="material-symbols-outlined text-[20px] text-cyan-600 dark:text-cyan-400">bolt</span>
                  <div>
                    <span className="font-bold text-[#0B1528] dark:text-white block leading-tight">Scalable Scientific</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Precision</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Teaser & Carousel Dots */}
            <div className="max-w-5xl mx-auto pt-4 flex items-center justify-between text-xs px-2">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 block">
                  PRIMARY SANDBOX
                </span>
                <span className="text-base sm:text-lg font-['Plus_Jakarta_Sans'] font-bold text-[#0B1528] dark:text-white">
                  Your Biology. Simulated in <span className="italic font-serif text-[#0284c7] dark:text-[#38bdf8]">Real-Time.</span>
                </span>
              </div>

              {/* Visual Carousel Indicators from reference */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Video Intro Showcase Section */}
      <section
        style={{
          backgroundImage: "url('/assets/aistudio/image_1ef853ca.png')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#06121D'
        }}
        className="relative overflow-hidden border-b border-cyan-500/20 py-8 sm:py-12 px-4 sm:px-6"
      >
        {/* Ambient overlay gradient to ensure high legibility and cohesive dark styling */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06121D]/90 via-[#06121D]/65 to-[#06121D]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#06121D_90%)] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <VideoIntroHeroCard onPlayVideo={onOpenVideoIntro} />
        </div>
      </section>

      {/* 3-Step Quick Guided Onboarding for First-Time Users */}
      <section
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }}
        style={{
          backgroundImage: "url('/assets/aistudio/image_1ef853ca.png')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#06121D'
        }}
        className="relative overflow-hidden py-14 px-6 border-b border-cyan-500/20 text-white"
      >
        {/* Continuous backdrop scrim */}
        <div className="absolute inset-0 bg-[#06121D]/80 backdrop-blur-[1px] pointer-events-none" />
        {/* Dynamic Pointer Glow Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(750px_circle_at_var(--mouse-x,50%)_var(--mouse-y,40%),rgba(6,182,212,0.18),transparent_70%)]" />
        {/* Kinetic Molecular Connector Spine */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#cyanGlowGrad1)" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="50%" cy="15%" r="4" fill="#06B6D4" className="animate-pulse" />
            <circle cx="50%" cy="85%" r="4" fill="#06B6D4" />
            <defs>
              <linearGradient id="cyanGlowGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              CLINICIAN &amp; RESEARCHER WORKFLOW
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              3 Steps to Computable Pharmacotherapy Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              No login or setup needed. Jump straight into physiological modeling or explore the clinical drug library.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative p-6 rounded-2xl bg-[#07192C]/85 hover:bg-[#0B243E]/95 border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-3.5 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                  01
                </span>
                <span className="material-symbols-outlined text-cyan-400 text-[24px] group-hover:scale-110 transition-transform">vital_signs</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-white">
                1. Select Organ Clearance Profile
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose from verified synthetic patient cases or calibrate renal labs (eGFR via CKD-EPI 2021, Cockcroft-Gault CrCl) and hepatic CYP2C9/CYP2C19/CYP2D6 genotypes.
              </p>
            </div>

            <div className="group relative p-6 rounded-2xl bg-[#07192C]/85 hover:bg-[#0B243E]/95 border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-3.5 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                  02
                </span>
                <span className="material-symbols-outlined text-cyan-400 text-[24px] group-hover:scale-110 transition-transform">show_chart</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-white">
                2. Run Pharmacokinetic Simulation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Observe dynamic 36-hour steady-state plasma curves (Css), half-life prolongation factors, and automated safety ceiling threshold alerts across KDIGO and CPIC.
              </p>
            </div>

            <div className="group relative p-6 rounded-2xl bg-[#07192C]/85 hover:bg-[#0B243E]/95 border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-3.5 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                  03
                </span>
                <span className="material-symbols-outlined text-emerald-400 text-[24px] group-hover:scale-110 transition-transform">verified</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-white">
                3. Personalize Regimen &amp; Export Audit
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Titrate drug dosages to prevent toxicity, test drug-drug interactions, and export an official de-identified PDF report or CSV audit dossier in one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Data Integration Pipeline */}
      <section
        id="pipeline"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }}
        style={{
          backgroundImage: "url('/assets/aistudio/image_1ef853ca.png')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#06121D'
        }}
        className="relative overflow-hidden py-16 px-6 border-b border-cyan-500/20 text-white"
      >
        {/* Continuous backdrop scrim */}
        <div className="absolute inset-0 bg-[#06121D]/82 backdrop-blur-[1px] pointer-events-none" />
        {/* Dynamic Pointer Glow Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(750px_circle_at_var(--mouse-x,50%)_var(--mouse-y,40%),rgba(6,182,212,0.18),transparent_70%)]" />
        {/* Molecular Grid Mesh Accent */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Computational Pipeline
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              From Biological Measurement to Scientific Prediction
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              How multimodal inputs resolve through mechanistic pharmacokinetic and biochemical rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {[
              {
                step: '01',
                title: 'Individual Patient Data',
                desc: 'Age, body metrics, serum creatinine, BUN, baseline electrolytes, and pharmacogenomic alleles.',
                icon: 'person'
              },
              {
                step: '02',
                title: 'Biological Model',
                desc: 'Calculated Cockcroft-Gault CrCl, 2021 CKD-EPI GFR, and hepatic CYP450 metabolizer status.',
                icon: 'vital_signs'
              },
              {
                step: '03',
                title: 'Pathway Analysis',
                desc: 'Multi-drug competitive CYP interactions, target binding affinity, and downstream biochemical cascades.',
                icon: 'hub'
              },
              {
                step: '04',
                title: 'Simulated Response',
                desc: 'Multi-dose steady-state plasma concentrations (Css), clearance half-life, and accumulation risks.',
                icon: 'show_chart'
              },
              {
                step: '05',
                title: 'Interpretation & Review',
                desc: 'Transparent comparison against KDIGO, ADA, CPIC, and FDA boxed warning rule thresholds.',
                icon: 'fact_check'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative p-5 rounded-2xl bg-[#07192C]/85 hover:bg-[#0B243E]/95 border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-3">
                    <span className="font-mono text-xs font-semibold text-cyan-400">{item.step}</span>
                    <span className="material-symbols-outlined text-[22px] text-cyan-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-white mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Digital Twin Teaser / Sandbox */}
      <section
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }}
        style={{
          backgroundImage: "url('/assets/aistudio/image_1ef853ca.png')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#06121D'
        }}
        className="relative overflow-hidden py-16 px-6 border-b border-cyan-500/20 text-white"
      >
        {/* Continuous backdrop scrim */}
        <div className="absolute inset-0 bg-[#06121D]/80 backdrop-blur-[1px] pointer-events-none" />
        {/* Dynamic Pointer Glow Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(800px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(6,182,212,0.2),transparent_70%)]" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
                Interactive Demonstration
              </span>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Experience Dynamic Renal Clearance Modeling
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Move the filtration slider to see how biological variance extends Metformin plasma half-life and alters the steady-state safety boundary.
              </p>

              <div className="pt-2">
                <button
                  onClick={onLaunchTwin}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-900/40 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Open Full Triage Console</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
              </div>
            </div>

            {/* Right Interactive Simulator Card */}
            <div className="lg:col-span-7 bg-[#07182B]/90 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Synthetic Biomarker Scrubber
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  eGFR: {interactiveEgfr} mL/min/1.73m²
                </span>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="1"
                  value={interactiveEgfr}
                  onChange={(e) => setInteractiveEgfr(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>15 (Severe CKD 4/5)</span>
                  <span>30 (Contraindicated)</span>
                  <span>45 (Dose Cap 1000mg)</span>
                  <span>90 (Normal)</span>
                </div>
              </div>

              {/* Real-time reactive metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#05101E]/90 border border-cyan-500/25 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Simulated Half-Life
                  </span>
                  <span className="text-xl font-bold font-mono text-white block">
                    {halfLifeHours} <span className="text-xs font-normal text-slate-400">hours</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Baseline: 6.2 hours
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#05101E]/90 border border-cyan-500/25 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Predicted Steady-State Peak
                  </span>
                  <span className={`text-xl font-bold font-mono block ${
                    isDanger ? 'text-rose-400' : isCaution ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {peakCss} <span className="text-xs font-normal text-slate-400">mcg/mL</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Target: 1.0–2.0 mcg/mL
                  </span>
                </div>
              </div>

              {/* Live Regulatory Assessment */}
              <div
                className={`p-3.5 rounded-xl border text-xs backdrop-blur-md ${
                isDanger
                  ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                  : isCaution
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                  : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
              }`}>
                <strong className="font-bold">Rule Evaluation: </strong>
                {isDanger
                  ? 'FDA Boxed Warning: eGFR <30 mL/min — Absolute contraindication due to high MALA risk.'
                  : isCaution
                  ? 'KDIGO 2023 Sec 1.3: eGFR 30–44 mL/min — Daily dose capped at maximum 1000 mg (or 500 mg BID).'
                  : 'Standard therapeutic clearance bounds; annual eGFR monitoring recommended.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Patient Individuality Matters */}
      <section
        id="why-individuality"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }}
        style={{
          backgroundImage: "url('/assets/aistudio/image_1ef853ca.png')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#06121D'
        }}
        className="relative overflow-hidden py-16 px-6 border-b border-cyan-500/20 text-white"
      >
        {/* Continuous backdrop scrim */}
        <div className="absolute inset-0 bg-[#06121D]/82 backdrop-blur-[1px] pointer-events-none" />
        {/* Dynamic Pointer Glow Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(750px_circle_at_var(--mouse-x,50%)_var(--mouse-y,40%),rgba(6,182,212,0.18),transparent_70%)]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Precision Pharmacology
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why Individual Biological Context Matters
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Fixed standard dosing creates silent therapeutic failure and heightened toxicity in vulnerable populations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative p-6 bg-[#07192C]/85 hover:bg-[#0B243E]/95 rounded-2xl border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-3 hover:-translate-y-1">
              <span className="material-symbols-outlined text-cyan-400 text-[30px] group-hover:scale-110 transition-transform">water_drop</span>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-white">
                Renal Clearance Divergence
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Standard dosages assume normal glomerular filtration (&gt;90 mL/min/1.73m²). In age-related or diabetic nephropathy, renally excreted compounds like Metformin and Lisinopril accumulate, escalating toxicities exponentially.
              </p>
            </div>

            <div className="group relative p-6 bg-[#07192C]/85 hover:bg-[#0B243E]/95 rounded-2xl border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-3 hover:-translate-y-1">
              <span className="material-symbols-outlined text-emerald-400 text-[30px] group-hover:scale-110 transition-transform">dna</span>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-white">
                Pharmacogenomic Polymorphism
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Variants in hepatic CYP450 isoenzymes (such as CYP2C9*3 or CYP2C19*2) radically impair metabolism of agents like Warfarin or Citalopram, turning normal doses into dangerous supratherapeutic exposures.
              </p>
            </div>

            <div className="group relative p-6 bg-[#07192C]/85 hover:bg-[#0B243E]/95 rounded-2xl border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-3 hover:-translate-y-1">
              <span className="material-symbols-outlined text-amber-400 text-[30px] group-hover:scale-110 transition-transform">warning</span>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-white">
                Geriatric Polypharmacy &amp; QT Drift
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Older adults face additive electrophysiological risks. Co-prescribing SSRIs with anti-dementia acetylcholinesterase inhibitors prolongs cardiac ventricular repolarization, precipitating Torsades de Pointes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disease Areas & Multi-Specialty Scope */}
      <section
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }}
        style={{
          backgroundImage: "url('/assets/aistudio/image_1ef853ca.png')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#06121D'
        }}
        className="relative overflow-hidden py-16 px-6 border-b border-cyan-500/20 text-white"
      >
        {/* Continuous backdrop scrim */}
        <div className="absolute inset-0 bg-[#06121D]/82 backdrop-blur-[1px] pointer-events-none" />
        {/* Dynamic Pointer Glow Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(750px_circle_at_var(--mouse-x,50%)_var(--mouse-y,40%),rgba(6,182,212,0.18),transparent_70%)]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Specialty Coverage
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Three Foundational Therapeutic Models
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Explore mechanistic models grounded in peer-reviewed clinical literature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative p-6 bg-[#07192C]/85 hover:bg-[#0B243E]/95 rounded-2xl border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-4 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-md uppercase border border-cyan-500/30">
                  Cardiometabolic &amp; Renal
                </span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-white mt-3">
                  Metformin, SGLT2i &amp; Renoprotection
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Tubuloglomerular feedback, intraglomerular hydrostatic de-escalation, and lactic acidosis thresholds in moderate to severe CKD.
                </p>
              </div>
              <button
                onClick={onOpenPathways}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer pt-2 group-hover:translate-x-1 transition-transform"
              >
                <span>View Pathway Cascade</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            <div className="group relative p-6 bg-[#07192C]/85 hover:bg-[#0B243E]/95 rounded-2xl border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-4 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-md uppercase border border-indigo-500/30">
                  Targeted Oncology
                </span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-white mt-3">
                  Kinase Inhibition &amp; Resistance
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  BCR-ABL1 inhibition by Imatinib in CML, and mutant-selective EGFR T790M inhibition by Osimertinib in NSCLC.
                </p>
              </div>
              <button
                onClick={onOpenPathways}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer pt-2 group-hover:translate-x-1 transition-transform"
              >
                <span>View Pathway Cascade</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            <div className="group relative p-6 bg-[#07192C]/85 hover:bg-[#0B243E]/95 rounded-2xl border border-cyan-500/25 hover:border-cyan-400/60 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-4 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-md uppercase border border-amber-500/30">
                  Neuropsychiatry
                </span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-white mt-3">
                  Monoamine Transporters &amp; Safety
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Serotonin transporter occupancy, CYP2C19 metabolism deficits, and FDA geriatric QTc interval ceilings.
                </p>
              </div>
              <button
                onClick={onOpenPathways}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer pt-2 group-hover:translate-x-1 transition-transform"
              >
                <span>View Pathway Cascade</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Boundaries & Limitations */}
      <section
        id="limitations"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }}
        style={{
          backgroundImage: "url('/assets/aistudio/image_1ef853ca.png')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#06121D'
        }}
        className="relative overflow-hidden py-16 px-6 text-white"
      >
        {/* Continuous backdrop scrim */}
        <div className="absolute inset-0 bg-[#06121D]/85 backdrop-blur-[1px] pointer-events-none" />
        {/* Dynamic Pointer Glow Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(750px_circle_at_var(--mouse-x,50%)_var(--mouse-y,40%),rgba(6,182,212,0.18),transparent_70%)]" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="p-7 rounded-2xl bg-[#07192C]/90 backdrop-blur-xl border border-cyan-500/25 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              <span className="material-symbols-outlined text-cyan-400 text-[26px]">verified</span>
              <span>Educational Simulation &amp; Clinical Decision Support Disclaimer</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              SYNTHOS is an educational precision-pharmacology simulation and digital-twin demonstrator. All patient cohorts are HIPAA-free synthetic constructs. The platform’s mathematical pharmacokinetic models, steady-state curves, and drug-target interactions represent deterministic computational approximations grounded in published peer-reviewed guidelines (KDIGO 2023, ADA 2024, CPIC Level-A, FDA Drug Safety Communications).
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              SYNTHOS does not provide autonomous clinical diagnosis, nor does it replace the independent professional judgment of a licensed clinical pharmacist (PharmD), toxicologist, or attending physician.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#020820' }} className="py-8 bg-[#020820] text-slate-400 border-t border-cyan-500/20 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">SYNTHOS</span>
            <span>·</span>
            <span>Where Biology Meets Its Other Self.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Deterministic Model v3.8.2</span>
            <span>·</span>
            <button onClick={onOpenEvidence} className="hover:text-white transition-colors cursor-pointer">
              Evidence Provenance
            </button>
            <span>·</span>
            <span>Educational Simulation Prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
