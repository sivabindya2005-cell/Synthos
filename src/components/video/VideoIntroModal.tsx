import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VIDEO_CHAPTERS, VIDEO_DURATION, VideoChapter } from './videoData';
import { VideoRenderer } from './canvasRenderer';
import { SynthosAudioEngine } from './audioEngine';

interface VideoIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchTwin: () => void;
  onOpenDrugIntelligence: () => void;
}

export const VideoIntroModal: React.FC<VideoIntroModalProps> = ({
  isOpen,
  onClose,
  onLaunchTwin,
  onOpenDrugIntelligence
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Video State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [enableVoiceover, setEnableVoiceover] = useState<boolean>(true);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Engine refs
  const rendererRef = useRef<VideoRenderer | null>(null);
  const audioEngineRef = useRef<SynthosAudioEngine | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const currentChapterIndexRef = useRef<number>(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize renderer and audio
  useEffect(() => {
    rendererRef.current = new VideoRenderer();
    audioEngineRef.current = new SynthosAudioEngine();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioEngineRef.current) audioEngineRef.current.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Determine current chapter
  const currentChapter = VIDEO_CHAPTERS.find(
    (ch) => currentTime >= ch.startTime && currentTime < ch.endTime
  ) || VIDEO_CHAPTERS[VIDEO_CHAPTERS.length - 1];

  const currentChapterIndex = VIDEO_CHAPTERS.findIndex((c) => c.id === currentChapter.id);

  // Voiceover narration helper
  const speakChapterNarration = useCallback((chapter: VideoChapter) => {
    if (!enableVoiceover || isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chapter.narration);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select a clear voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (englishVoice) utterance.voice = englishVoice;
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  }, [enableVoiceover, isMuted]);

  // Handle chapter changes for audio mood & voiceover
  useEffect(() => {
    if (!isOpen) return;
    if (currentChapterIndex !== currentChapterIndexRef.current) {
      currentChapterIndexRef.current = currentChapterIndex;
      if (audioEngineRef.current) {
        audioEngineRef.current.setChapterMood(currentChapterIndex);
        audioEngineRef.current.playScannerPing(currentChapterIndex % 2 === 0 ? 880 : 1040);
      }
      if (isPlaying) {
        speakChapterNarration(currentChapter);
      }
    }
  }, [currentChapterIndex, currentChapter, isOpen, isPlaying, speakChapterNarration]);

  // Handle open / close audio state
  useEffect(() => {
    if (isOpen) {
      if (audioEngineRef.current && isPlaying) {
        audioEngineRef.current.start();
        audioEngineRef.current.setMuted(isMuted);
      }
      if (isPlaying && currentChapter) {
        speakChapterNarration(currentChapter);
      }
    } else {
      if (audioEngineRef.current) audioEngineRef.current.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Update mute state in audio engine
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setMuted(isMuted);
    }
    if (isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted]);

  // Canvas render animation loop
  useEffect(() => {
    if (!isOpen) return;

    const renderLoop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= VIDEO_DURATION) {
            setIsPlaying(false);
            if (audioEngineRef.current) audioEngineRef.current.stop();
            return VIDEO_DURATION;
          }
          return next;
        });
      }

      // Draw canvas frame
      const canvas = canvasRef.current;
      if (canvas && rendererRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          rendererRef.current.render(ctx, currentTime, VIDEO_DURATION);
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, playbackSpeed, currentTime]);

  // Keyboard shortcut listener (Space = Play/Pause, Esc = Close, F = Fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, isPlaying]);

  const togglePlayPause = () => {
    if (currentTime >= VIDEO_DURATION) {
      setCurrentTime(0);
      setIsPlaying(true);
      if (audioEngineRef.current) audioEngineRef.current.start();
      return;
    }
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        if (audioEngineRef.current) audioEngineRef.current.start();
        speakChapterNarration(currentChapter);
      } else {
        if (audioEngineRef.current) audioEngineRef.current.stop();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(VIDEO_DURATION, newTime));
    setCurrentTime(clamped);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const ch = VIDEO_CHAPTERS.find((c) => clamped >= c.startTime && clamped < c.endTime);
    if (ch && isPlaying) {
      speakChapterNarration(ch);
    }
  };

  const jumpToChapter = (chapter: VideoChapter) => {
    handleSeek(chapter.startTime);
    if (!isPlaying) {
      setIsPlaying(true);
      if (audioEngineRef.current) audioEngineRef.current.start();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Export video as downloadable HD WebM file using MediaRecorder
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !('MediaRecorder' in window)) {
      console.warn('MediaRecorder is not supported in this browser.');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setIsPlaying(false);
    setCurrentTime(0);

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SYNTHOS_Video_Intro_Where_Biology_Meets_Its_Other_Self.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setExportProgress(100);
    };

    mediaRecorder.start();

    // Fast-render sequence
    const totalFrames = VIDEO_DURATION * 30;
    let currentFrame = 0;
    const ctx = canvas.getContext('2d');

    const renderNextFrame = () => {
      if (currentFrame >= totalFrames || !isExporting) {
        mediaRecorder.stop();
        return;
      }

      const simTime = (currentFrame / 30);
      setCurrentTime(simTime);
      if (ctx && rendererRef.current) {
        rendererRef.current.render(ctx, simTime, VIDEO_DURATION);
      }
      currentFrame++;
      setExportProgress(Math.round((currentFrame / totalFrames) * 100));

      // Process in tight animation frames
      setTimeout(renderNextFrame, 16);
    };

    renderNextFrame();
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl bg-[#07131b] border border-teal-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Top Video Header Bar */}
        <div className="px-5 py-3.5 bg-[#091b26] border-b border-teal-900/40 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-white tracking-wide">
              SYNTHOS PLATFORM VIDEO TOUR
            </span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-teal-400 font-medium">Where Biology Meets Its Other Self</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportVideo}
              disabled={isExporting}
              className="px-2.5 py-1 rounded bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-500/40 font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download HD Video File (.webm)"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>{isExporting ? `Exporting ${exportProgress}%...` : 'Download HD Video'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Intro"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            onClick={togglePlayPause}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Subtitles & Closed Captions Overlay */}
          {showSubtitles && (
            <div className="absolute bottom-16 left-6 right-6 flex justify-center pointer-events-none">
              <div className="max-w-3xl px-6 py-2.5 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 text-center shadow-lg transition-all">
                <span className="font-mono text-[11px] text-teal-400 font-bold block mb-0.5 uppercase tracking-wider">
                  {currentChapter.badge}
                </span>
                <p className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base text-white/95 font-medium leading-snug drop-shadow-md">
                  {currentChapter.narration}
                </p>
              </div>
            </div>
          )}

          {/* Large Center Play Icon when Paused */}
          {!isPlaying && currentTime < VIDEO_DURATION && !isExporting && (
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-[#14B8A6]/80 hover:bg-[#E6F4F1]0 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all scale-100 hover:scale-105 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[44px] ml-1">play_arrow</span>
            </button>
          )}

          {/* Video End State Screen */}
          {currentTime >= VIDEO_DURATION && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-6 p-6 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-teal-900 border border-teal-500/50 flex items-center justify-center shadow-2xl">
                <span className="material-symbols-outlined text-[36px] text-teal-400">check_circle</span>
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-white">
                  SYNTHOS Precision Medicine Workspace
                </h3>
                <p className="text-sm text-slate-300">
                  Where Biology Meets Its Other Self. Explore patient-specific digital twins, organ clearance simulations, and 305 target-classified drug monographs.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onLaunchTwin();
                  }}
                  className="px-6 py-3 rounded-xl bg-[#14B8A6] hover:bg-[#E6F4F1]0 text-white font-semibold text-sm shadow-lg shadow-teal-900/40 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span>Launch Digital Twin Simulation</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenDrugIntelligence();
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                  <span>Browse 305 Drugs</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTime(0);
                    setIsPlaying(true);
                    if (audioEngineRef.current) audioEngineRef.current.start();
                  }}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  <span>Replay</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="p-4 bg-[#091b26] border-t border-teal-900/30 flex flex-col gap-3">
          {/* Interactive Timeline Scrubber with Chapter Markers */}
          <div className="relative w-full group py-1">
            <input
              type="range"
              min={0}
              max={VIDEO_DURATION}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
            />
            {/* Chapter Pins along the bar */}
            <div className="absolute top-2 left-0 right-0 h-2 pointer-events-none flex justify-between px-1">
              {VIDEO_CHAPTERS.map((ch) => (
                <div
                  key={ch.id}
                  style={{ left: `${(ch.startTime / VIDEO_DURATION) * 100}%` }}
                  className="absolute w-1 h-3 -top-0.5 bg-slate-500/80 rounded"
                  title={`${ch.title} (${formatTime(ch.startTime)})`}
                />
              ))}
            </div>
          </div>

          {/* Lower Action Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-slate-300 text-xs">
            {/* Left Controls: Play/Pause, Replay, Time, Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="w-8 h-8 rounded-lg bg-[#E6F4F1]0/20 hover:bg-[#E6F4F1]0 text-teal-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button
                onClick={() => handleSeek(0)}
                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Restart"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
              </button>

              <span className="font-mono text-slate-400 font-semibold tracking-wide">
                <span className="text-white">{formatTime(currentTime)}</span> / {formatTime(VIDEO_DURATION)}
              </span>

              <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>

              {/* Audio Synthesizer Mute / Unmute */}
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="flex items-center gap-1.5 p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound (M)'}
              >
                <span className="material-symbols-outlined text-[18px] text-teal-400">
                  {isMuted ? 'volume_off' : 'volume_up'}
                </span>
                <span className="hidden md:inline font-mono text-[11px]">
                  {isMuted ? 'MUTED' : 'SYNTH_AUDIO'}
                </span>
              </button>
            </div>

            {/* Center Chapter Jump Buttons */}
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
              {VIDEO_CHAPTERS.map((ch, idx) => {
                const isActive = currentChapter.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => jumpToChapter(ch)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#E6F4F1]0/30 text-teal-300 border border-teal-500/50'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {idx + 1}. {ch.title.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Voiceover, Subtitles, Speed, Fullscreen, Launch */}
            <div className="flex items-center gap-2">
              {/* Spoken Voiceover Toggle */}
              <button
                onClick={() => setEnableVoiceover((prev) => !prev)}
                className={`p-1.5 rounded text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  enableVoiceover ? 'text-teal-400 hover:bg-[#E6F4F1]0/10' : 'text-slate-500 hover:bg-white/5'
                }`}
                title="Toggle AI Speech Voiceover"
              >
                <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                <span className="hidden sm:inline">VOICEOVER</span>
              </button>

              {/* CC Subtitles Toggle */}
              <button
                onClick={() => setShowSubtitles((prev) => !prev)}
                className={`px-2 py-1 rounded font-mono font-bold text-[11px] transition-colors cursor-pointer ${
                  showSubtitles ? 'bg-teal-900 text-teal-300 border border-teal-600/40' : 'text-slate-500 hover:bg-white/5'
                }`}
                title="Toggle Subtitles / Closed Captions"
              >
                CC
              </button>

              {/* Speed Selector */}
              <button
                onClick={() => {
                  const speeds = [0.75, 1, 1.25, 1.5];
                  const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                  setPlaybackSpeed(speeds[nextIdx]);
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
                title="Change Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen (F)"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onLaunchTwin();
                }}
                className="ml-2 px-3.5 py-1.5 rounded-lg bg-[#14B8A6] hover:bg-[#E6F4F1]0 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Twin</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
