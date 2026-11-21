import React from 'react';
import { UserProfile } from '../types';
import labChamberImage from '../assets/images/investigation_chamber_lab_1792418981947.jpg';
import cyberfortLogo from '../assets/images/cyberfort-logo.jpeg';
import { Shield, Target, Award, ArrowRight, Eye, Monitor, LogIn, Lock } from 'lucide-react';

interface LandingViewProps {
  user: UserProfile | null;
  onStartMission: () => void;
  onOpenAuth: (mode?: 'student-login' | 'student-register' | 'coordinator-login') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  user,
  onStartMission,
  onOpenAuth
}) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-mono text-emerald-400 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CYBER DEFENSE TOURNAMENT 2026</span>
            <span aria-hidden="true" className="text-emerald-700">·</span>
            <span className="text-cyan-300">ROUND 03: OPERATION SHADOW HUNT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight font-sans">
            Investigate the Breach. Correlate the Evidence.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Capture the Flag.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-sans">
            A critical security incident has occurred across our network infrastructure. Every participating investigator
            is assigned an individualized forensic environment with distinct evidence logs, system records, and personalized flags.
            You have exactly 25 minutes to inspect the chamber, correlate the shared signature across evidence nodes, and submit the capture flag.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {user ? (
              <button
                onClick={onStartMission}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                Enter Final Round <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenAuth('student-register')}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  Register as Student <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuth('student-login')}
                  className="px-5 py-3 rounded-lg border border-slate-700 hover:border-emerald-500/50 bg-slate-900/70 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" /> Student Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('coordinator-login')}
                  className="px-4 py-3 rounded-lg border border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/30 text-xs font-mono text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Coordinator Access
                </button>
              </div>
            )}
          </div>

          {/* Unboxed Metadata Row */}
          <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono border-t border-slate-800">
            <span className="text-emerald-400">Duration: 25:00 Minutes</span>
            <span aria-hidden="true">·</span>
            <span>Eligibility: 1st & 2nd Year</span>
            <span aria-hidden="true">·</span>
            <span>Max Score: 100 Pts</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400">Individualized Challenges</span>
          </div>
        </div>

        {/* Hero Visual Anchor with CyberFort Official Logo & Lab Preview */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl glass-panel group">
            <img
              src={labChamberImage}
              alt="Forensics Lab Chamber"
              referrerPolicy="no-referrer"
              className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute top-3 right-3 p-1.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 shadow-lg">
              <img
                src={cyberfortLogo}
                alt="CyberFort Badge"
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-contain rounded"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-950/85 backdrop-blur border border-emerald-400/30 text-xs font-mono">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <Target className="w-4 h-4" /> OPERATION SHADOW HUNT
              </div>
              <p className="text-slate-300 text-[11px] mt-1 font-sans">
                Real-time forensic investigation environment. Active attempt window: <strong className="text-cyan-300">25:00</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Forensic Investigation Protocol */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-wide font-sans">
          Investigation Architecture & Challenge Mechanics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-xl border border-emerald-500/20 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Monitor className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">1. Inspect Three Incident Nodes</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Examine the Digital Workstation, CCTV Screen, and Access Log Terminal.
              Each artifact contains an evidentiary forensic record tailored to your assigned incident. Finding all three yields 30 points.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-cyan-500/20 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">2. Signal Correlation</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Analyze the records to deduce the shared signature that appears identically across all three logs.
              Discovering all three signals unlocks the Capture the Flag Terminal.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-emerald-500/20 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">3. Submit Flag & Video Extraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Format your flag as <code className="text-emerald-300 font-mono font-bold">CYBERFORT{'{YOUR_DISCOVERED_PATTERN}'}</code>.
              Correct submission triggers the cinematic superhero flag-capture video celebration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
