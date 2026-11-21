import React, { useState } from 'react';
import { UserProfile, Attempt } from '../types';
import { VideoFlagCapture } from './VideoFlagCapture';
import { ShieldCheck, ArrowRight, Trophy, CheckCircle2, RotateCcw } from 'lucide-react';

interface FlagRewardModalProps {
  attempt: Attempt;
  user: UserProfile;
  onReturnDashboard: () => void;
  onViewLeaderboard: () => void;
}

export const FlagRewardModal: React.FC<FlagRewardModalProps> = ({
  attempt,
  user,
  onReturnDashboard,
  onViewLeaderboard
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const personalizedFlag = attempt.submittedFlag || 'CYBERFORT{LAB_1}';

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
  };

  const handleSkipVideo = () => {
    setIsVideoPlaying(false);
  };

  const handleReplayVideo = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center min-h-[75vh] transition-all duration-500">
      {/* Mode 1: Cinematic Superhero Video Overlay */}
      {isVideoPlaying ? (
        <div className="w-full flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <VideoFlagCapture
            flag={personalizedFlag}
            onEnded={handleVideoEnded}
            onSkip={handleSkipVideo}
          />

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-1">
            <span>Verified Extraction Video</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleSkipVideo}
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
            >
              Skip directly to Victory Debrief
            </button>
          </div>
        </div>
      ) : (
        /* Mode 2: Official Victory Briefing Screen */
        <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-2xl border border-emerald-400/50 shadow-2xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/25">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              MISSION ACCOMPLISHED · VERIFIED EXTRACTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-sans tracking-tight">
              FLAG CAPTURED
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">
              CYBERFORT CTF 2026 — OPERATION SHADOW HUNT
            </p>
          </div>

          {/* Captured Flag Display Container */}
          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 text-center space-y-1 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              INDIVIDUALIZED AUTHORITATIVE FLAG ARTIFACT
            </span>
            <div className="text-lg sm:text-2xl font-mono font-extrabold text-emerald-300 tracking-wider select-all">
              {personalizedFlag}
            </div>
          </div>

          {/* Verification Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">FINAL SCORE</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block tabular-nums">
                {attempt.score} / 100
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TIME ELAPSED</span>
              <span className="text-lg font-bold text-white mt-0.5 block tabular-nums">
                {attempt.durationSeconds || 0}s
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CLUES VERIFIED</span>
              <span className="text-lg font-bold text-cyan-400 mt-0.5 block tabular-nums">
                3 of 3
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HINTS USED</span>
              <span className="text-lg font-bold text-amber-400 mt-0.5 block tabular-nums">
                {attempt.hintsUsed} (-{attempt.hintsUsed * 5} pts)
              </span>
            </div>
          </div>

          {/* Participant Attribution */}
          <div className="pt-1 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Investigator: <strong className="text-white">{user.fullName}</strong> ({user.regNo} · {user.yearOfStudy})
            </span>
          </div>

          {/* Action Buttons: Replay Video, Leaderboard, Return to Dashboard */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleReplayVideo}
              className="py-3 px-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-emerald-400"
              title="Watch the superhero flag capture video celebration again"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" /> Replay Video
            </button>

            <button
              onClick={onViewLeaderboard}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4" /> View Leaderboard
            </button>

            <button
              onClick={onReturnDashboard}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Return to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
