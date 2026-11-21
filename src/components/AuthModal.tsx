import React, { useState } from 'react';
import { UserProfile } from '../types';
import cyberfortLogo from '../assets/images/cyberfort-logo.jpeg';
import { Shield, Lock, UserCheck, KeyRound, AlertCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'student-login' | 'student-register' | 'coordinator-login';
  onAuthSuccess: (user: UserProfile, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'student-login',
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'student-login' | 'student-register' | 'coordinator-login'>(initialMode);
  const [coordinatorSubMode, setCoordinatorSubMode] = useState<'login' | 'setup'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState<'First Year' | 'Second Year'>('First Year');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');

      localStorage.setItem('cyberfort_auth_token', data.token);
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          regNo: regNo.trim(),
          yearOfStudy,
          password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      localStorage.setItem('cyberfort_auth_token', data.token);
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCoordinatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/auth/coordinator-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Coordinator authentication failed.');

      localStorage.setItem('cyberfort_auth_token', data.token);
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCoordinatorSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (password.length < 8) {
      setError('Coordinator password must be at least 8 characters in length.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/coordinator-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: password,
          confirmPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Coordinator password setup failed.');

      setSuccessMsg('Coordinator credentials established successfully!');
      localStorage.setItem('cyberfort_auth_token', data.token);
      onAuthSuccess(data.user, data.token);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-emerald-500/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative p-1 rounded-xl bg-slate-950 border border-emerald-500/40 shrink-0">
            <img
              src={cyberfortLogo}
              alt="CyberFort Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 object-contain rounded"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white font-sans flex items-center gap-2">
              {mode === 'coordinator-login'
                ? coordinatorSubMode === 'setup'
                  ? 'Coordinator Password Setup'
                  : 'Coordinator Operations Sign In'
                : mode === 'student-register'
                ? 'Student CTF Registration'
                : 'Student Sign In'}
            </h3>
            <p className="text-xs text-emerald-400/80 font-mono">
              {mode === 'coordinator-login'
                ? 'CYBERFORT 2026 Authoritative Portal Access'
                : 'OPERATION SHADOW HUNT · Forensic Verification'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg mb-5 border border-emerald-500/20 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setMode('student-login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'student-login'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('student-register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'student-register'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Student
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('coordinator-login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'coordinator-login'
                ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Coordinator
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Student Login Form */}
        {mode === 'student-login' && (
          <form onSubmit={handleStudentLogin} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aarav.sharma@cyberfort.edu"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              <KeyRound className="w-4 h-4" /> {loading ? 'Authenticating...' : 'Sign In as Student'}
            </button>
          </form>
        )}

        {/* Student Register Form */}
        {mode === 'student-register' && (
          <form onSubmit={handleStudentRegister} className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maya Chen"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-400 font-sans"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">College Registration Number</label>
              <input
                type="text"
                required
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="e.g. 2026CS4102"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white uppercase focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Year of Study</label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Role Assigned</label>
                <input
                  type="text"
                  disabled
                  value="STUDENT"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-500 font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Institutional Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. m.chen@cyberfort.edu"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Account Password (min 6 chars)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              <UserCheck className="w-4 h-4" /> {loading ? 'Registering...' : 'Register as Student'}
            </button>
          </form>
        )}

        {/* Coordinator Login & Setup Forms (STRICTLY NO QUICK-FILL) */}
        {mode === 'coordinator-login' && coordinatorSubMode === 'login' && (
          <form onSubmit={handleCoordinatorLogin} className="space-y-3.5 text-xs font-mono">
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> AUTHORIZED COORDINATOR ACCESS ONLY:
              </span>
              Enter your registered coordinator credentials to access participant audits, timer resets, and challenge operations.
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Coordinator Email</label>
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter coordinator email..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Coordinator Password</label>
              <input
                type="password"
                required
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-600/30"
            >
              <Lock className="w-4 h-4" /> {loading ? 'Verifying Authorization...' : 'Sign In as Coordinator'}
            </button>

            <div className="pt-2 text-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCoordinatorSubMode('setup');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
              >
                First time or need to reset coordinator password? Click here
              </button>
            </div>
          </form>
        )}

        {/* Coordinator Setup / Reset Form (Allowlisted emails) */}
        {mode === 'coordinator-login' && coordinatorSubMode === 'setup' && (
          <form onSubmit={handleCoordinatorSetup} className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 text-cyan-300 mb-1">
                <Shield className="w-3.5 h-3.5" /> COORDINATOR CREDENTIAL INITIALIZATION:
              </span>
              Allowlisted coordinators can establish or update their secure password.
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Authorized Coordinator Email</label>
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vikas2006126@gmail.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">New Secure Password (min 8 chars)</label>
              <input
                type="password"
                required
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose new password..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                autoComplete="off"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              <KeyRound className="w-4 h-4" /> {loading ? 'Configuring Credentials...' : 'Set Password & Sign In'}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setCoordinatorSubMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
              >
                Back to Standard Coordinator Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
