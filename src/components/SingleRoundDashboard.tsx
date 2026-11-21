import React from 'react';
import { UserProfile, Attempt, Challenge } from '../types';
import { Shield, Target, Play, Award, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import labChamberImage from '../assets/images/investigation_chamber_lab_1792418981947.jpg';

interface SingleRoundDashboardProps {
  user: UserProfile;
  attempt: Attempt | null;
  challenge: Challenge | null;
  onEnterChamber: () => void;
  onViewReward: () => void;
}

export const SingleRoundDashboard: React.FC<SingleRoundDashboardProps> = ({
  user,
  attempt,
  challenge,
  onEnterChamber,
  onViewReward
}) => {
  const isCompleted = attempt?.completed;
  const isExpired = attempt?.expired && !attempt.completed;
  const isInProgress = attempt && !attempt.completed && !attempt.expired;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Investigator Profile Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
            Registered Investigator Profile
          </div>
          <h2 className="text-xl font-bold text-white mt-1 font-sans">{user.fullName}</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mt-1">
            <span>Reg: {user.regNo}</span>
            <span aria-hidden="true">·</span>
            <span>{user.yearOfStudy}</span>
            <span aria-hidden="true">·</span>
            <span>{user.email}</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-300 font-bold">Role: {user.role}</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5 sm:justify-end">
            <CheckCircle className="w-4 h-4" /> ELIGIBILITY VERIFIED
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            Round Status:{' '}
            {isCompleted
              ? 'Flag Captured'
              : isExpired
              ? 'Time Expired'
              : isInProgress
              ? 'Chamber Active'
              : 'Ready to Deploy'}
          </div>
        </div>
      </div>

      {/* Strictly EXACTLY ONE Single Playable Final Round Card */}
      <div className="glass-panel rounded-2xl border border-cyan-500/40 relative overflow-hidden shadow-2xl">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={labChamberImage}
            alt="Operation Shadow Hunt Lab"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="inline-block px-3 py-1 rounded bg-slate-900/90 border border-cyan-400/40 text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest shadow-md">
              ROUND 03 — FINAL ROUND
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <h3 className="text-2xl font-black text-white tracking-wide font-sans">
              {challenge ? challenge.title : 'OPERATION SHADOW HUNT'}
            </h3>
            <p className="text-xs font-mono text-cyan-300 mt-1">
              VENUE: {challenge ? challenge.venueLabel : 'CYBER DEFENSE FORENSICS'}
            </p>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed font-sans">
              Enter your assigned investigation chamber, discover three connected forensic clues, correlate the shared
              signature, and capture the authoritative flag within the strict 25-minute challenge window.
            </p>
          </div>

          {/* Attempt Status Bar */}
          {isCompleted ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div>
                <span className="text-emerald-400 font-bold block">CHALLENGE COMPLETED</span>
                <span className="text-slate-300 mt-0.5 block">
                  Authoritative Flag: <code className="text-cyan-300 font-bold">{attempt.submittedFlag}</code>
                </span>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-white font-bold text-base tabular-nums">{attempt.score} / 100 PTS</span>
                <span className="text-slate-400 block text-[11px] tabular-nums">{attempt.durationSeconds}s elapsed</span>
              </div>
            </div>
          ) : isExpired ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>25-MINUTE TIME LIMIT EXPIRED — ATTEMPT LOCKED</span>
              </div>
              <span className="text-emerald-400 font-bold tabular-nums">{attempt.score} PTS</span>
            </div>
          ) : isInProgress ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between font-mono text-xs">
              <span className="text-emerald-300">
                Signals Discovered: <strong className="text-white">{attempt.collectedClues.length} of 3</strong>
              </span>
              <span className="text-slate-400">
                Flag Terminal:{' '}
                <strong className={attempt.collectedClues.length >= 3 ? 'text-emerald-400' : 'text-slate-500'}>
                  {attempt.collectedClues.length >= 3 ? 'UNLOCKED' : 'LOCKED (3 Nodes Req.)'}
                </strong>
              </span>
            </div>
          ) : null}

          {/* Primary Action Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-yellow-400" /> MAX: 100 PTS
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> 25:00 MINUTES LIMIT
              </span>
            </div>

            {isCompleted ? (
              <button
                onClick={onViewReward}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Award className="w-4 h-4" /> View Flag Reward Video
              </button>
            ) : isExpired ? (
              <button
                disabled
                className="px-6 py-2.5 rounded-lg bg-slate-800 text-slate-500 font-bold font-mono text-xs uppercase tracking-wider cursor-not-allowed"
              >
                Attempt Concluded (Expired)
              </button>
            ) : (
              <button
                onClick={onEnterChamber}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" /> {isInProgress ? 'Resume Final Round' : 'Start 25-Min Final Round'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
