/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Attempt, Challenge } from './types';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { SingleRoundDashboard } from './components/SingleRoundDashboard';
import { InvestigationChamber } from './components/InvestigationChamber';
import { FlagRewardModal } from './components/FlagRewardModal';
import { LeaderboardView } from './components/LeaderboardView';
import { CoordinatorPortal } from './components/CoordinatorPortal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('cyberfort_auth_token');
  });

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'chamber' | 'reward' | 'leaderboard' | 'coordinator'>('landing');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'student-login' | 'student-register' | 'coordinator-login'>('student-login');

  // Verify and restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('cyberfort_auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);

          // If student, check if they have an active attempt
          if (data.user.role === 'STUDENT') {
            await fetchStudentAttempt(storedToken);
          }
        } else {
          // Token invalid or expired
          localStorage.removeItem('cyberfort_auth_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const fetchStudentAttempt = async (authToken: string) => {
    try {
      const res = await fetch('/api/attempt/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAttempt(data.attempt);
        setChallenge(data.challenge);
        return data.attempt;
      }
    } catch (err) {
      console.error('Failed to load student attempt:', err);
    }
    return null;
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('cyberfort_auth_token');
    setUser(null);
    setToken(null);
    setAttempt(null);
    setChallenge(null);
    setCurrentView('landing');
  };

  const handleAuthSuccess = async (authenticatedUser: UserProfile, authToken: string) => {
    setUser(authenticatedUser);
    setToken(authToken);

    if (authenticatedUser.role === 'COORDINATOR' || authenticatedUser.role === 'ADMINISTRATOR' || authenticatedUser.isCoordinator) {
      setCurrentView('coordinator');
    } else {
      const att = await fetchStudentAttempt(authToken);
      if (att?.completed) {
        setCurrentView('reward');
      } else {
        setCurrentView('dashboard');
      }
    }
  };

  const handleStartMission = async () => {
    if (!token) {
      setAuthModalMode('student-login');
      setAuthModalOpen(true);
      return;
    }

    const att = await fetchStudentAttempt(token);
    if (att?.completed) {
      setCurrentView('reward');
    } else {
      setCurrentView('chamber');
    }
  };

  const openAuth = (mode: 'student-login' | 'student-register' | 'coordinator-login' = 'student-login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-cyan-400 font-mono text-xs">
        <div className="w-12 h-12 rounded-xl border border-cyan-400/40 border-t-cyan-400 animate-spin mb-4" />
        <span className="tracking-widest">INITIALIZING SECURE CYBER DEFENSE TERMINAL...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid flex flex-col bg-slate-950 text-slate-100">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'dashboard' && !user) {
            openAuth('student-login');
            return;
          }
          if (view === 'coordinator' && !user) {
            openAuth('coordinator-login');
            return;
          }
          setCurrentView(view);
        }}
        user={user}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
      />

      {/* Main Viewport Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            user={user}
            onStartMission={handleStartMission}
            onOpenAuth={openAuth}
          />
        )}

        {currentView === 'dashboard' && user && (
          <SingleRoundDashboard
            user={user}
            attempt={attempt}
            challenge={challenge}
            onEnterChamber={handleStartMission}
            onViewReward={() => setCurrentView('reward')}
          />
        )}

        {currentView === 'chamber' && user && attempt && challenge && token && (
          <InvestigationChamber
            user={user}
            attempt={attempt}
            challenge={challenge}
            token={token}
            onUpdateAttempt={(updated) => setAttempt(updated)}
            onSuccess={(completedAttempt) => {
              setAttempt(completedAttempt);
              setCurrentView('reward');
            }}
            onTimeExpired={() => {
              setAttempt((prev) => (prev ? { ...prev, expired: true } : null));
            }}
          />
        )}

        {currentView === 'reward' && user && attempt && (
          <FlagRewardModal
            attempt={attempt}
            user={user}
            onReturnDashboard={() => setCurrentView('dashboard')}
            onViewLeaderboard={() => setCurrentView('leaderboard')}
          />
        )}

        {currentView === 'leaderboard' && <LeaderboardView />}

        {currentView === 'coordinator' && (
          <CoordinatorPortal
            user={user}
            token={token}
            onOpenAuth={openAuth}
            onNavigateDashboard={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Clean Footer without Clutter */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div>
            <span>CYBERFORT CTF 2026 · Career Press School · 25-Minute Final Round</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('leaderboard')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Official Standings
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                if (user?.role === 'COORDINATOR' || user?.role === 'ADMINISTRATOR' || user?.isCoordinator) {
                  setCurrentView('coordinator');
                } else {
                  openAuth('coordinator-login');
                }
              }}
              className="hover:text-purple-400 transition-colors cursor-pointer"
            >
              Coordinator Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Professional Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
