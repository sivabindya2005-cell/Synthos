import React, { useState } from 'react';
import { VideoIntroHeroCard } from '../video/VideoIntroHeroCard';
import { SynthosLogo } from '../common/SynthosLogo';

interface PublicHomeViewProps {
  onLaunchTwin: () => void;
  onOpenPathways: () => void;
  onOpenDrugIntelligence: () => void;
  onOpenEvidence: () => void;
  onOpenVideoIntro: () => void;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({
  onLaunchTwin,
  onOpenPathways,
  onOpenDrugIntelligence,
  onOpenEvidence,
  onOpenVideoIntro
}) => {
  const [interactiveEgfr, setInteractiveEgfr] = useState<number>(42);

  // Quick illustrative calculation for homepage interactive teaser
  const halfLifeHours = Number((6.2 * (90 / Math.max(15, interactiveEgfr))).toFixed(1));
  const peakCss = Number((1.8 * (60 / Math.max(15, interactiveEgfr))).toFixed(2));
  const isDanger = interactiveEgfr < 30;
  const isCaution = interactiveEgfr >= 30 && interactiveEgfr <= 44;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071321] text-[#334155] dark:text-slate-300 font-sans">
      {/* 3-Zone Clean Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071321]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-[#1E3A5A] shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Official SYNTHOS Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
            title="SYNTHOS — Where Biology Meets Its Other Self."
          >
            <SynthosLogo size="md" variant="horizontal" theme="auto" showTagline={false} />
          </button>

          {/* Zone 2: 4-5 concise single-line text links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#334155] dark:text-slate-300">
            <a href="#pipeline" className="hover:text-[#0B2545] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Architecture
            </a>
            <a href="#why-individuality" className="hover:text-[#0B2545] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Why Individuality
            </a>
            <button onClick={onOpenPathways} className="hover:text-[#0B2545] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer">
              Pathway Explorer
            </button>
            <button onClick={onOpenDrugIntelligence} className="hover:text-[#0B2545] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer">
              Drug Intelligence
            </button>
            <a href="#limitations" className="hover:text-[#0B2545] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Scientific Boundaries
            </a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenVideoIntro}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] bg-[#E6F4F1] dark:bg-[#0F2137] border border-[#BEE3DB] dark:border-[#1E3A5A] rounded-lg hover:bg-[#D4ECE6] dark:hover:bg-[#132B42] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Watch 65s Video Overview"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0F766E] dark:text-[#14B8A6]">play_circle</span>
              <span className="hidden sm:inline">Video Intro</span>
            </button>

            {/* Magnetic Centerpiece Top Button */}
            <button
              onClick={onLaunchTwin}
              className="relative px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0F766E] via-[#0D645D] to-[#0B2545] hover:from-[#0B2545] hover:to-[#0F766E] rounded-xl transition-all shadow-md hover:shadow-[#0F766E]/20 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ring-2 ring-[#14B8A6]/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-ping"></span>
              <span>Launch Digital Twin</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 dark:border-[#1E3A5A] bg-white dark:bg-[#071321]">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          {/* Prominent Official SYNTHOS Emblem Showcase */}
          <div className="flex flex-col items-center justify-center pt-2 pb-1">
            <SynthosLogo size="lg" variant="icon" theme="auto" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] dark:bg-[#0F2137] border border-[#BEE3DB] dark:border-[#1E3A5A] text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] uppercase tracking-wider font-mono shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
            <span>Precision Medicine &amp; Computational Pharmacology Platform</span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B2545] dark:text-[#F8FAFC] tracking-tight text-balance leading-tight">
            SYNTHOS — Where Biology Meets Its Other Self.
          </h1>

          <p className="text-base sm:text-lg text-[#334155] dark:text-slate-300 max-w-2xl mx-auto text-balance leading-relaxed">
            Explore how individual biological characteristics, clinical laboratory parameters, and pharmaceutical science unite into an interactive digital twin simulation.
          </p>

          {/* CENTRE OF ATTRACTION: Magnetic Glowing Launch Twin Showcase */}
          <div className="pt-4 pb-4 flex flex-col items-center justify-center relative">
            {/* Ethereal background aura glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#14B8A6]/20 via-[#2DD4BF]/25 to-[#0F766E]/20 rounded-3xl blur-2xl opacity-75 pointer-events-none animate-pulse"></div>

            {/* Live Attraction Header Badge */}
            <div className="relative mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B2545] border border-[#14B8A6]/50 shadow-lg shadow-[#0B2545]/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14B8A6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#14B8A6]"></span>
              </span>
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#2DD4BF] uppercase">
                Primary Sandbox · Live Digital Twin Platform
              </span>
            </div>

            {/* The Magnetic Launch Button Container */}
            <div className="relative group p-1.5 rounded-2xl bg-gradient-to-r from-[#14B8A6] via-[#2DD4BF] to-[#0F766E] shadow-2xl shadow-[#0F766E]/30 hover:shadow-[#14B8A6]/50 transition-all duration-300 hover:scale-[1.03] active:scale-[0.99]">
              <button
                onClick={onLaunchTwin}
                className="w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-extrabold text-white bg-[#0B2545] hover:bg-[#071930] rounded-xl transition-all flex items-center justify-center gap-4 cursor-pointer group-hover:bg-opacity-95"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/20 border border-[#14B8A6]/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#2DD4BF] text-[26px] animate-pulse">
                      tune
                    </span>
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <div className="tracking-tight flex items-center gap-2.5">
                    <span className="text-white text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans']">
                      Launch Patient Digital Twin
                    </span>
                    <span className="material-symbols-outlined text-[28px] text-[#2DD4BF] group-hover:translate-x-2 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-teal-100/90 mt-0.5 tracking-normal">
                    Interactive clinical decision support &amp; organ clearance workbench
                  </span>
                </div>
              </button>
            </div>

            {/* Feature Guarantee Badges Under Launch Button */}
            <div className="relative mt-3.5 flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-[#334155] dark:text-slate-300 font-semibold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E6F4F1] dark:bg-[#0F2137] border border-[#BEE3DB] dark:border-[#1E3A5A] text-[#0F766E] dark:text-[#14B8A6]">
                <span className="material-symbols-outlined text-[14px] text-[#0F766E] dark:text-[#14B8A6]">bolt</span>
                <span>Instant Live Execution</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-[#0F2137] border border-slate-200 dark:border-[#1E3A5A] text-[#0B2545] dark:text-slate-200">
                <span className="material-symbols-outlined text-[14px] text-[#14B8A6]">lock_open</span>
                <span>No Sign-in Required</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E6F4F1] dark:bg-[#0F2137] border border-[#BEE3DB] dark:border-[#1E3A5A] text-[#0F766E] dark:text-[#14B8A6]">
                <span className="material-symbols-outlined text-[14px] text-[#0F766E] dark:text-[#14B8A6]">security</span>
                <span>De-Identified &amp; Confidential</span>
              </span>
            </div>

            {/* Secondary Supporting Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={onOpenVideoIntro}
                className="px-5 py-2.5 text-xs font-semibold text-[#0B2545] dark:text-[#F8FAFC] bg-white dark:bg-[#0F2137] border border-slate-300 dark:border-[#1E3A5A] hover:bg-[#E6F4F1] dark:hover:bg-[#132B42] rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-2 group"
              >
                <span className="material-symbols-outlined text-[18px] text-[#0F766E] dark:text-[#14B8A6] group-hover:scale-110 transition-transform">play_circle</span>
                <span>Video Tour (01:05)</span>
              </button>

              <button
                onClick={onOpenDrugIntelligence}
                className="px-5 py-2.5 text-xs font-semibold text-[#334155] dark:text-slate-200 bg-[#E6F4F1] dark:bg-[#0F2137] hover:bg-[#D4ECE6] dark:hover:bg-[#132B42] rounded-lg transition-all cursor-pointer flex items-center gap-2 border border-[#BEE3DB] dark:border-[#1E3A5A]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#0F766E] dark:text-[#14B8A6]">auto_stories</span>
                <span>Drug Intelligence (305+)</span>
              </button>
            </div>
          </div>

          {/* Short Horizontal Workflow Diagram */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="p-3.5 rounded-xl bg-[#E6F4F1] dark:bg-[#0F2137] border border-[#BEE3DB] dark:border-[#1E3A5A] flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-[#334155] dark:text-slate-300">
              <span className="font-bold text-[#0B2545] dark:text-[#F8FAFC]">Patient characteristics</span>
              <span className="text-[#14B8A6] font-bold">→</span>
              <span className="font-bold text-[#0B2545] dark:text-[#F8FAFC]">Biological model</span>
              <span className="text-[#14B8A6] font-bold">→</span>
              <span className="font-bold text-[#0B2545] dark:text-[#F8FAFC]">Drug and pathway analysis</span>
              <span className="text-[#14B8A6] font-bold">→</span>
              <span className="font-bold text-[#0B2545] dark:text-[#F8FAFC]">Simulated response</span>
              <span className="text-[#14B8A6] font-bold">→</span>
              <span className="font-bold text-[#0B2545] dark:text-[#F8FAFC]">Evidence and interpretation</span>
            </div>
          </div>

          <div className="pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Deterministic CDS Engine</span>
            <span className="mx-2">·</span>
            <span>Zero Hallucination Tolerance</span>
            <span className="mx-2">·</span>
            <span>HIPAA-Free Synthetic Data</span>
          </div>
        </div>
      </section>

      {/* Cinematic Video Intro Showcase Section */}
      <section className="bg-[#F8FAFC] dark:bg-[#071321] border-b border-slate-200 dark:border-[#1E3A5A] py-6 px-6">
        <VideoIntroHeroCard onPlayVideo={onOpenVideoIntro} />
      </section>

      {/* 3-Step Quick Guided Onboarding for First-Time Users */}
      <section className="py-12 bg-white dark:bg-[#071321] border-b border-slate-200 dark:border-[#1E3A5A]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
              CLINICIAN &amp; RESEARCHER WORKFLOW
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0B2545] dark:text-[#F8FAFC]">
              3 Steps to Computable Pharmacotherapy Verification
            </h2>
            <p className="text-xs text-[#334155] dark:text-slate-300">
              No login or setup needed. Jump straight into physiological modeling or explore the clinical drug library.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F2137] border border-slate-200 dark:border-[#1E3A5A] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-[#0F766E] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                  01
                </span>
                <span className="material-symbols-outlined text-[#14B8A6] text-[22px]">vital_signs</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#0B2545] dark:text-[#F8FAFC]">
                1. Select Organ Clearance Profile
              </h3>
              <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
                Choose from verified synthetic patient cases or calibrate renal labs (eGFR via CKD-EPI 2021, Cockcroft-Gault CrCl) and hepatic CYP2C9/CYP2C19/CYP2D6 genotypes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F2137] border border-slate-200 dark:border-[#1E3A5A] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-[#0F766E] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                  02
                </span>
                <span className="material-symbols-outlined text-[#14B8A6] text-[22px]">show_chart</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#0B2545] dark:text-[#F8FAFC]">
                2. Run Pharmacokinetic Simulation
              </h3>
              <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
                Observe dynamic 36-hour steady-state plasma curves (Css), half-life prolongation factors, and automated safety ceiling threshold alerts across KDIGO and CPIC.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F2137] border border-slate-200 dark:border-[#1E3A5A] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-[#0F766E] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                  03
                </span>
                <span className="material-symbols-outlined text-[#14B8A6] text-[22px]">verified</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#0B2545] dark:text-[#F8FAFC]">
                3. Personalize Regimen &amp; Export Audit
              </h3>
              <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
                Titrate drug dosages to prevent toxicity, test drug-drug interactions, and export an official de-identified PDF report or CSV audit dossier in one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Data Integration Pipeline */}
      <section id="pipeline" className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
            Computational Pipeline
          </span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-[#0B2545] dark:text-[#F8FAFC]">
            From Biological Measurement to Scientific Prediction
          </h2>
          <p className="text-sm text-[#334155] dark:text-slate-300">
            How multimodal inputs resolve through mechanistic pharmacokinetic and biochemical rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
              className="p-5 rounded-xl bg-white dark:bg-[#0F2137] border border-slate-200 dark:border-[#1E3A5A] shadow-2xs flex flex-col justify-between hover:border-[#14B8A6] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="font-mono text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6]">{item.step}</span>
                  <span className="material-symbols-outlined text-[20px] text-[#14B8A6]">{item.icon}</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#0B2545] dark:text-[#F8FAFC] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Digital Twin Teaser / Sandbox */}
      <section className="py-16 bg-[#0B2545] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono text-[#2DD4BF] uppercase tracking-wider block">
                Interactive Demonstration
              </span>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Experience Dynamic Renal Clearance Modeling
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Move the filtration slider to see how biological variance extends Metformin plasma half-life and alters the steady-state safety boundary.
              </p>

              <div className="pt-2">
                <button
                  onClick={onLaunchTwin}
                  className="px-5 py-2.5 rounded-lg bg-[#14B8A6] hover:bg-[#0F766E] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <span>Open Full Triage Console</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
              </div>
            </div>

            {/* Right Interactive Simulator Card */}
            <div className="lg:col-span-7 bg-[#071930] rounded-2xl p-6 border border-[#1E3A5A] space-y-5">
              <div className="flex items-center justify-between border-b border-[#1E3A5A] pb-3">
                <span className="text-xs font-mono text-slate-400 uppercase">
                  Synthetic Biomarker Scrubber
                </span>
                <span className="text-xs font-mono font-bold text-[#2DD4BF]">
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
                  className="w-full accent-[#14B8A6] cursor-pointer"
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
                <div className="p-3 bg-[#0B2545] rounded-lg border border-[#1E3A5A]">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Simulated Half-Life
                  </span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">
                    {halfLifeHours} <span className="text-xs font-normal text-slate-400">hours</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Baseline: 6.2 hours
                  </span>
                </div>

                <div className="p-3 bg-[#0B2545] rounded-lg border border-[#1E3A5A]">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Predicted Steady-State Peak
                  </span>
                  <span className={`text-xl font-bold font-mono mt-1 block ${
                    isDanger ? 'text-[#DC2626]' : isCaution ? 'text-amber-400' : 'text-[#2DD4BF]'
                  }`}>
                    {peakCss} <span className="text-xs font-normal text-slate-400">mcg/mL</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Target: 1.0–2.0 mcg/mL
                  </span>
                </div>
              </div>

              {/* Live Regulatory Assessment */}
              <div className={`p-3 rounded-lg border text-xs ${
                isDanger
                  ? 'bg-rose-950/70 border-[#DC2626] text-rose-200'
                  : isCaution
                  ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                  : 'bg-[#0F766E]/20 border-[#14B8A6]/50 text-teal-200'
              }`}>
                <strong>Rule Evaluation: </strong>
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
      <section id="why-individuality" className="py-16 max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
            Precision Pharmacology
          </span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-[#0B2545] dark:text-[#F8FAFC]">
            Why Individual Biological Context Matters
          </h2>
          <p className="text-sm text-[#334155] dark:text-slate-300">
            Fixed standard dosing creates silent therapeutic failure and heightened toxicity in vulnerable populations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#0F2137] rounded-xl border border-slate-200 dark:border-[#1E3A5A] shadow-2xs space-y-3">
            <span className="material-symbols-outlined text-[#0F766E] dark:text-[#14B8A6] text-[28px]">water_drop</span>
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0B2545] dark:text-[#F8FAFC]">
              Renal Clearance Divergence
            </h3>
            <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
              Standard dosages assume normal glomerular filtration (&gt;90 mL/min/1.73m²). In age-related or diabetic nephropathy, renally excreted compounds like Metformin and Lisinopril accumulate, escalating toxicities exponentially.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#0F2137] rounded-xl border border-slate-200 dark:border-[#1E3A5A] shadow-2xs space-y-3">
            <span className="material-symbols-outlined text-[#0B2545] dark:text-[#2DD4BF] text-[28px]">dna</span>
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0B2545] dark:text-[#F8FAFC]">
              Pharmacogenomic Polymorphism
            </h3>
            <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
              Variants in hepatic CYP450 isoenzymes (such as CYP2C9*3 or CYP2C19*2) radically impair metabolism of agents like Warfarin or Citalopram, turning normal doses into dangerous supratherapeutic exposures.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#0F2137] rounded-xl border border-slate-200 dark:border-[#1E3A5A] shadow-2xs space-y-3">
            <span className="material-symbols-outlined text-[#DC2626] text-[28px]">warning</span>
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0B2545] dark:text-[#F8FAFC]">
              Geriatric Polypharmacy &amp; QT Drift
            </h3>
            <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
              Older adults face additive electrophysiological risks. Co-prescribing SSRIs with anti-dementia acetylcholinesterase inhibitors prolongs cardiac ventricular repolarization, precipitating Torsades de Pointes.
            </p>
          </div>
        </div>
      </section>

      {/* Disease Areas & Multi-Specialty Scope */}
      <section className="py-16 bg-[#F8FAFC] dark:bg-[#071321] border-t border-slate-200 dark:border-[#1E3A5A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
              Specialty Coverage
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-[#0B2545] dark:text-[#F8FAFC]">
              Three Foundational Therapeutic Models
            </h2>
            <p className="text-sm text-[#334155] dark:text-slate-300">
              Explore mechanistic models grounded in peer-reviewed clinical literature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white dark:bg-[#0F2137] rounded-xl border border-slate-200 dark:border-[#1E3A5A] shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0F766E] dark:text-[#14B8A6] bg-[#E6F4F1] dark:bg-[#132B42] px-2 py-0.5 rounded uppercase border border-[#BEE3DB] dark:border-[#1E3A5A]">
                  Cardiometabolic &amp; Renal
                </span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0B2545] dark:text-[#F8FAFC] mt-2">
                  Metformin, SGLT2i &amp; Renoprotection
                </h3>
                <p className="text-xs text-[#334155] dark:text-slate-300 mt-1 leading-relaxed">
                  Tubuloglomerular feedback, intraglomerular hydrostatic de-escalation, and lactic acidosis thresholds in moderate to severe CKD.
                </p>
              </div>
              <button
                onClick={onOpenPathways}
                className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:text-[#0B2545] dark:hover:text-white flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>View Pathway Cascade</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>

            <div className="p-5 bg-white dark:bg-[#0F2137] rounded-xl border border-slate-200 dark:border-[#1E3A5A] shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0B2545] dark:text-[#2DD4BF] bg-indigo-50 dark:bg-[#132B42] px-2 py-0.5 rounded uppercase border border-indigo-200 dark:border-[#1E3A5A]">
                  Targeted Oncology
                </span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0B2545] dark:text-[#F8FAFC] mt-2">
                  Kinase Inhibition &amp; Resistance
                </h3>
                <p className="text-xs text-[#334155] dark:text-slate-300 mt-1 leading-relaxed">
                  BCR-ABL1 inhibition by Imatinib in CML, and mutant-selective EGFR T790M inhibition by Osimertinib in NSCLC.
                </p>
              </div>
              <button
                onClick={onOpenPathways}
                className="text-xs font-semibold text-[#0B2545] dark:text-[#14B8A6] hover:text-[#0F766E] dark:hover:text-white flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>View Pathway Cascade</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>

            <div className="p-5 bg-white dark:bg-[#0F2137] rounded-xl border border-slate-200 dark:border-[#1E3A5A] shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 dark:bg-[#132B42] px-2 py-0.5 rounded uppercase border border-amber-200 dark:border-[#1E3A5A]">
                  Neuropsychiatry
                </span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0B2545] dark:text-[#F8FAFC] mt-2">
                  Monoamine Transporters &amp; Safety
                </h3>
                <p className="text-xs text-[#334155] dark:text-slate-300 mt-1 leading-relaxed">
                  Serotonin transporter occupancy, CYP2C19 metabolism deficits, and FDA geriatric QTc interval ceilings.
                </p>
              </div>
              <button
                onClick={onOpenPathways}
                className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:text-[#0B2545] dark:hover:text-white flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>View Pathway Cascade</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Boundaries & Limitations */}
      <section id="limitations" className="py-16 max-w-5xl mx-auto px-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F2137] border border-slate-200 dark:border-[#1E3A5A] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#0B2545] dark:text-[#F8FAFC] font-bold text-base">
            <span className="material-symbols-outlined text-[#0F766E] dark:text-[#14B8A6] text-[24px]">verified</span>
            <span>Educational Simulation &amp; Clinical Decision Support Disclaimer</span>
          </div>
          <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
            SYNTHOS is an educational precision-pharmacology simulation and digital-twin demonstrator. All patient cohorts are HIPAA-free synthetic constructs. The platform’s mathematical pharmacokinetic models, steady-state curves, and drug-target interactions represent deterministic computational approximations grounded in published peer-reviewed guidelines (KDIGO 2023, ADA 2024, CPIC Level-A, FDA Drug Safety Communications).
          </p>
          <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed font-medium">
            SYNTHOS does not provide autonomous clinical diagnosis, nor does it replace the independent professional judgment of a licensed clinical pharmacist (PharmD), toxicologist, or attending physician.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0B2545] text-slate-300 border-t border-[#1E3A5A] text-xs">
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
