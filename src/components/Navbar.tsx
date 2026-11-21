import React from 'react';
import { UserProfile } from '../types';
import cyberfortLogo from '../assets/images/cyberfort-logo.jpeg';
import { LogIn, LogOut, ShieldCheck, KeyRound } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'chamber' | 'reward' | 'leaderboard' | 'coordinator';
  onNavigate: (view: 'landing' | 'dashboard' | 'chamber' | 'reward' | 'leaderboard' | 'coordinator') => void;
  user: UserProfile | null;
  onOpenAuth: (mode?: 'student-login' | 'student-register' | 'coordinator-login') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/92 backdrop-blur-md border-b border-emerald-500/20 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark with Official CyberFort Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 hover:opacity-95 transition-opacity cursor-pointer group"
        >
          <div className="relative p-0.5 rounded-lg bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-400/40 shadow-sm shadow-emerald-500/20">
            <img
              src={cyberfortLogo}
              alt="CyberFort Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded object-contain bg-slate-950"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wider text-white font-sans flex items-center gap-1.5">
              <span className="text-emerald-400">CYBER</span>
              <span className="text-cyan-400">FORT</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 ml-1">
                2026
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              OPERATION SHADOW HUNT
            </span>
          </div>
        </button>

        {/* Zone 2: Single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentView === 'landing' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentView === 'dashboard' || currentView === 'chamber' || currentView === 'reward'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'hover:text-white'
            }`}
          >
            Final Round
          </button>
          <button
            onClick={() => onNavigate('leaderboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentView === 'leaderboard' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'hover:text-white'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => onNavigate('coordinator')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              currentView === 'coordinator' ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' : 'hover:text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Coordinator Portal
          </button>
        </nav>

        {/* Zone 3: Primary action / Auth status */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 text-xs text-slate-200 font-mono flex items-center gap-2 whitespace-nowrap shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.role === 'ADMINISTRATOR'
                      ? 'bg-purple-400 shadow-sm shadow-purple-400'
                      : user.role === 'COORDINATOR'
                      ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                      : 'bg-cyan-400'
                  }`}
                />
                <span className="max-w-[120px] truncate">{user.fullName}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    user.role === 'ADMINISTRATOR'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                      : user.role === 'COORDINATOR'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-red-950/60 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('coordinator-login')}
                className="px-3 py-1.5 rounded-lg border border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/40 text-emerald-300 font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" /> Coordinator
              </button>
              <button
                onClick={() => onOpenAuth('student-login')}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-sm shadow-emerald-500/20"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
