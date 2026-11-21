import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  FastForward,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface VideoFlagCaptureProps {
  flag: string;
  onEnded: () => void;
  onSkip: () => void;
}

export const VideoFlagCapture: React.FC<VideoFlagCaptureProps> = ({
  flag,
  onEnded,
  onSkip
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayMuted, setAutoplayMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Preferred video path with fallback to uploaded asset path
  const primaryVideoSrc = '/assets/flag-capture.mp4';
  const fallbackVideoSrc = '/assets/aistudio/flag-capture_7281d700.mp4';
  const [currentSrc, setCurrentSrc] = useState(primaryVideoSrc);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setIsLoading(true);
    setHasError(false);

    // Attempt autoplay with sound first; fallback to muted if browser blocks
    const attemptPlay = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Unmuted autoplay blocked by browser policy. Retrying muted:', err);
        video.muted = true;
        setIsMuted(true);
        setAutoplayMuted(true);
        try {
          await video.play();
          setIsPlaying(true);
        } catch (mutedErr) {
          console.warn('Muted autoplay also blocked:', mutedErr);
          setIsPlaying(false);
        }
      }
    };

    attemptPlay();

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      onEnded();
    };

    const handleError = () => {
      console.warn('Video failed to load from:', currentSrc);
      if (currentSrc === primaryVideoSrc) {
        // Try fallback source
        setCurrentSrc(fallbackVideoSrc);
      } else {
        setHasError(true);
        setIsLoading(false);
        // Fallback to victory screen after brief delay to avoid blank screen
        setTimeout(() => {
          onEnded();
        }, 800);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      try {
        video.pause();
      } catch (e) {
        // ignore
      }
    };
  }, [currentSrc, onEnded]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      setAutoplayMuted(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (hasError) {
    return (
      <div className="w-full max-w-4xl glass-panel p-8 rounded-2xl border border-red-500/40 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-white font-bold text-lg">Flag Capture Protocol Verified</h3>
        <p className="text-slate-400 text-xs font-mono">
          Cinematic video stream concluded. Transitioning to victory briefing...
        </p>
        <button
          onClick={onSkip}
          className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase"
        >
          Proceed to Victory Screen
        </button>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden glass-panel border border-emerald-500/40 shadow-2xl bg-slate-950 flex flex-col group transition-all duration-500 select-none"
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-bold tracking-wider uppercase text-[11px] sm:text-xs">
            CYBERFORT · SUPERHERO EXTRACTION CINEMATIC
          </span>
        </div>

        <button
          onClick={onSkip}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          title="Skip cinematic and view final victory debrief"
        >
          <span>SKIP ANIMATION</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Video Viewport - Preserves Natural Aspect Ratio & Prevents Distortion */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={currentSrc}
          playsInline
          autoPlay
          preload="auto"
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-cyan-400 font-mono text-xs z-20">
            <div className="w-10 h-10 rounded-xl border border-cyan-400/40 border-t-cyan-400 animate-spin" />
            <span className="tracking-widest uppercase">STREAMING CAPTURE EXTRACTION...</span>
          </div>
        )}

        {/* Autoplay Muted Indicator / Click to Unmute Prompt */}
        {autoplayMuted && isMuted && (
          <button
            onClick={toggleMute}
            className="absolute top-16 right-4 z-30 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-400 text-emerald-300 hover:bg-emerald-900 text-xs font-mono flex items-center gap-2 shadow-lg animate-bounce cursor-pointer"
          >
            <VolumeX className="w-4 h-4 text-emerald-400" />
            <span>Click to Unmute Audio</span>
          </button>
        )}
      </div>

      {/* Bottom Timeline & Player Controls */}
      <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800/80 flex flex-col gap-2">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer">
          <div
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-emerald-400 hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-emerald-400" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline text-[11px]">{isMuted ? 'Muted' : 'Sound On'}</span>
            </button>

            <div className="text-[11px] text-slate-400 tabular-nums">
              <span>{formatSeconds(currentTime)}</span> / <span>{formatSeconds(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-slate-500">FLAG:</span>
              <span className="font-bold text-emerald-300 font-mono">{flag}</span>
            </div>

            <button
              onClick={onSkip}
              className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700 cursor-pointer"
            >
              Skip Animation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
