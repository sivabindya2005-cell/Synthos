import React, { useState, useEffect } from 'react';
import { VIDEO_CHAPTERS, VIDEO_DURATION } from './videoData';
import { SynthosLogo } from '../common/SynthosLogo';

interface VideoIntroHeroCardProps {
  onPlayVideo: () => void;
}

export const VideoIntroHeroCard: React.FC<VideoIntroHeroCardProps> = ({ onPlayVideo }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  // Cycle preview chapters every 4 seconds in the teaser preview card
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveChapterIndex((prev) => (prev + 1) % VIDEO_CHAPTERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeChapter = VIDEO_CHAPTERS[activeChapterIndex];

  return (
    <div className="relative w-full max-w-5xl mx-auto my-8 rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-[#07151e] text-white">
      {/* Decorative Background Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/30 via-[#07151e] to-black pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#14b8a6_1px,transparent_1px),linear-gradient(to_bottom,#14b8a6_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Content Grid */}
      <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left: Teaser Info */}
        <div className="flex-1 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1]0/15 border border-teal-500/30 text-teal-300 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span>PLATFORM VIDEO TOUR · 60 FPS</span>
          </div>

          <h3 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Where Biology Meets Its Other Self.
          </h3>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Watch the 65-second scientific overview: how individual multi-omics, 305 target-classified therapeutics, and deterministic pharmacokinetic equations unite into a personalized digital twin.
          </p>

          {/* Chapter Timeline Indicator */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {VIDEO_CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChapterIndex(idx);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeChapterIndex === idx
                    ? 'bg-[#E6F4F1]0/30 text-teal-300 border border-teal-500/60 font-semibold'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                0{idx + 1} {ch.title.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Current Chapter Preview Card */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <span className="material-symbols-outlined text-teal-400 text-[20px] shrink-0 mt-0.5">
              movie
            </span>
            <div className="text-xs">
              <span className="font-mono text-teal-400 font-semibold block">
                {activeChapter.badge} · {activeChapter.title}
              </span>
              <span className="text-slate-300 italic line-clamp-1">
                "{activeChapter.narration}"
              </span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Video Thumbnail Screen */}
        <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-teal-500/40 shadow-2xl bg-black group shrink-0">
          {/* Animated Stylized Background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#0a2330] to-teal-950 flex flex-col items-center justify-center p-6 text-center">
            {/* Official SYNTHOS Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-teal-400/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xl">
              <SynthosLogo size={42} variant="icon" theme="dark" />
            </div>

            <span className="font-['Plus_Jakarta_Sans'] font-bold text-white text-base tracking-wide">
              SYNTHOS PLATFORM VIDEO TOUR
            </span>
            <span className="font-mono text-xs text-teal-400 mt-1">
              Duration: 01:05 · Spatial Sound · HD Download
            </span>
          </div>

          {/* Glowing Play Overlay */}
          <button
            onClick={onPlayVideo}
            className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all cursor-pointer"
            aria-label="Play Video Intro"
          >
            <div className="w-16 h-16 rounded-full bg-[#14B8A6] group-hover:bg-[#E6F4F1]0 text-white flex items-center justify-center shadow-xl shadow-teal-950/80 group-hover:scale-110 transition-all">
              <span className="material-symbols-outlined text-[36px] ml-1">play_arrow</span>
            </div>
          </button>

          {/* Time Badge */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white font-bold">
            01:05
          </div>
        </div>
      </div>
    </div>
  );
};
