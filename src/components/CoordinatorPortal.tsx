import React, { useState, useEffect } from 'react';
import { UserProfile, ParticipantRecord, AuditLogEntry, ChallengeDraft, ManagedUserRecord, UserRole, AccountStatus } from '../types';
import cyberfortLogo from '../assets/images/cyberfort-logo.jpeg';
import {
  Lock,
  Download,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  History,
  X,
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  Database,
  Users,
  HardDrive,
  Copy,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  UserCog,
  Shield,
  Trash2,
  Filter,
  Check,
  Clock,
  Mail,
  User as UserIcon
} from 'lucide-react';

interface CoordinatorPortalProps {
  user: UserProfile | null;
  token: string | null;
  onOpenAuth: (mode?: 'student-login' | 'student-register' | 'coordinator-login') => void;
  onNavigateDashboard: () => void;
}

interface DatabaseInspectData {
  databaseFilePath: string;
  databaseFileSize: number;
  lastSaved: number;
  summary: {
    totalUsers: number;
    studentCount: number;
    coordinatorCount: number;
    totalChallenges: number;
    totalAttempts: number;
    completedAttempts: number;
    activeSessions: number;
    auditLogsCount: number;
    draftsCount: number;
  };
  users: any[];
  attempts: Record<string, any>;
  challenges: any[];
  auditLogs: any[];
}

export const CoordinatorPortal: React.FC<CoordinatorPortalProps> = ({
  user,
  token,
  onOpenAuth,
  onNavigateDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'participants' | 'user-management' | 'database' | 'ai-generator'>('participants');

  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [drafts, setDrafts] = useState<ChallengeDraft[]>([]);
  const [dbInspect, setDbInspect] = useState<DatabaseInspectData | null>(null);

  // User Management state
  const [managedUsers, setManagedUsers] = useState<ManagedUserRecord[]>([]);
  const [userSummary, setUserSummary] = useState<{
    total: number;
    students: number;
    coordinators: number;
    administrators: number;
    deactivated: number;
  } | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'COORDINATOR' | 'ADMINISTRATOR'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DEACTIVATED'>('ALL');

  // Role Change Modal state
  const [roleModalTarget, setRoleModalTarget] = useState<ManagedUserRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('COORDINATOR');
  const [roleReason, setRoleReason] = useState('');
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Deactivate/Reactivate Modal state
  const [statusModalTarget, setStatusModalTarget] = useState<ManagedUserRecord | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Permanent Delete Modal state
  const [deleteModalTarget, setDeleteModalTarget] = useState<ManagedUserRecord | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Generator state
  const [draftingAI, setDraftingAI] = useState(false);
  const [latestDraft, setLatestDraft] = useState<ChallengeDraft | null>(null);
  const [activatingDraft, setActivatingDraft] = useState(false);

  // Reset modal state
  const [resetModalTarget, setResetModalTarget] = useState<ParticipantRecord | null>(null);
  const [resetReason, setResetReason] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Database inspector search & view
  const [dbSearch, setDbSearch] = useState('');
  const [copiedDb, setCopiedDb] = useState(false);

  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isCoordinator = user?.role === 'COORDINATOR' || user?.role === 'ADMINISTRATOR' || user?.isCoordinator;

  const fetchCoordinatorData = async () => {
    if (!token || !isCoordinator) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/moderator/participants', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Access denied.');
      }
      const data = await res.json();
      setParticipants(data.participants || []);
      setAuditLogs(data.auditLogs || []);

      // Fetch managed users for User Management section
      const usersRes = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setManagedUsers(usersData.users || []);
        setUserSummary(usersData.summary || null);
      }

      // Fetch drafts
      const draftRes = await fetch('/api/moderator/drafts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (draftRes.ok) {
        const draftData = await draftRes.json();
        setDrafts(draftData.drafts || []);
      }

      // Fetch database inspect data
      const dbRes = await fetch('/api/moderator/database-inspect', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbInspect(dbData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinatorData();
  }, [user, token]);

  const handleGenerateVariant = async () => {
    if (!token) return;
    setDraftingAI(true);
    setNotification(null);
    try {
      const res = await fetch('/api/moderator/generate-variant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLatestDraft(data.draft);
      setDrafts(prev => [data.draft, ...prev]);
      setNotification({
        text: `New challenge scenario drafted by Gemini AI: "${data.draft.commonLocationPhrase}"`,
        type: 'success'
      });
    } catch (err: any) {
      setNotification({ text: `AI Generation failed: ${err.message}`, type: 'error' });
    } finally {
      setDraftingAI(false);
    }
  };

  const handleActivateDraft = async (draftId: string) => {
    if (!token) return;
    setActivatingDraft(true);
    try {
      const res = await fetch('/api/moderator/activate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ draftId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotification({
        text: `Active challenge updated: ${data.message}`,
        type: 'success'
      });
      fetchCoordinatorData();
    } catch (err: any) {
      setNotification({ text: `Activation failed: ${err.message}`, type: 'error' });
    } finally {
      setActivatingDraft(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalTarget || !resetReason.trim() || !token) return;

    setResetSubmitting(true);
    try {
      const res = await fetch('/api/moderator/reset-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUid: resetModalTarget.uid,
          reason: resetReason.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotification({
        text: `Attempt reset for ${resetModalTarget.fullName} (${resetModalTarget.regNo}) logged in audit trail.`,
        type: 'success'
      });
      setResetModalTarget(null);
      setResetReason('');
      fetchCoordinatorData();
    } catch (err: any) {
      setNotification({ text: `Reset failed: ${err.message}`, type: 'error' });
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleDownloadCsv = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/export-csv', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('CSV download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CYBERFORT_2026_RESULTS_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setNotification({ text: `CSV Export failed: ${err.message}`, type: 'error' });
    }
  };

  const handleDownloadDatabase = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/moderator/download-database', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Database download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyberfort_db_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setNotification({ text: `Database download failed: ${err.message}`, type: 'error' });
    }
  };

  const handleCopyDatabaseJson = () => {
    if (!dbInspect) return;
    navigator.clipboard.writeText(JSON.stringify(dbInspect, null, 2));
    setCopiedDb(true);
    setTimeout(() => setCopiedDb(false), 2000);
  };

  // User Management Action Handlers
  const handleOpenRoleModal = (u: ManagedUserRecord) => {
    setRoleModalTarget(u);
    setSelectedRole(u.role === 'STUDENT' ? 'COORDINATOR' : u.role === 'COORDINATOR' ? 'ADMINISTRATOR' : 'COORDINATOR');
    setRoleReason('');
  };

  const handleConfirmRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalTarget || !token) return;
    setRoleSubmitting(true);
    try {
      const res = await fetch('/api/admin/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUid: roleModalTarget.uid,
          newRole: selectedRole,
          reason: roleReason.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotification({
        text: data.message,
        type: 'success'
      });
      setRoleModalTarget(null);
      fetchCoordinatorData();
    } catch (err: any) {
      setNotification({ text: `Role change failed: ${err.message}`, type: 'error' });
    } finally {
      setRoleSubmitting(false);
    }
  };

  const handleOpenStatusModal = (u: ManagedUserRecord) => {
    setStatusModalTarget(u);
    setStatusReason('');
  };

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalTarget || !token) return;
    const nextStatus = statusModalTarget.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    setStatusSubmitting(true);
    try {
      const res = await fetch('/api/admin/set-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUid: statusModalTarget.uid,
          status: nextStatus,
          reason: statusReason.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotification({
        text: data.message,
        type: 'success'
      });
      setStatusModalTarget(null);
      fetchCoordinatorData();
    } catch (err: any) {
      setNotification({ text: `Status update failed: ${err.message}`, type: 'error' });
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (u: ManagedUserRecord) => {
    setDeleteModalTarget(u);
    setDeleteConfirmationText('');
    setDeleteReason('');
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalTarget || !token) return;
    if (
      deleteConfirmationText.trim().toLowerCase() !== deleteModalTarget.email.toLowerCase() &&
      deleteConfirmationText.trim().toUpperCase() !== 'DELETE'
    ) {
      setNotification({ text: 'Confirmation mismatch. Please type the user email or DELETE to confirm.', type: 'error' });
      return;
    }
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteModalTarget.uid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: deleteReason.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotification({
        text: data.message,
        type: 'success'
      });
      setDeleteModalTarget(null);
      fetchCoordinatorData();
    } catch (err: any) {
      setNotification({ text: `Permanent deletion failed: ${err.message}`, type: 'error' });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Case 1: Visitor is Logged Out
  if (!user || !token) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 glass-panel rounded-2xl border border-emerald-500/40 text-center space-y-5">
        <div className="relative p-1.5 w-16 h-16 rounded-2xl bg-slate-950 border border-emerald-500/50 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <img
            src={cyberfortLogo}
            alt="CyberFort Logo"
            referrerPolicy="no-referrer"
            className="w-12 h-12 object-contain rounded"
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-xl text-white font-sans">Coordinator Access Required</h3>
          <p className="text-xs text-emerald-400 font-mono">AUTHORIZED TOURNAMENT OFFICIALS ONLY</p>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          The Coordinator Operations Command grants direct access to live participant tracking, timer resets,
          Gemini AI challenge bank drafts, and the complete tournament database.
        </p>
        <button
          onClick={() => onOpenAuth('coordinator-login')}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25"
        >
          <KeyRound className="w-4 h-4" /> Sign In as Coordinator
        </button>
      </div>
    );
  }

  // Case 2: User is Logged In as a STUDENT (Strict Access Denied)
  if (!isCoordinator) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 glass-panel rounded-2xl border border-red-500/50 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/50 mx-auto flex items-center justify-center text-red-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-xl text-white font-sans">403: Access Denied</h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          You are currently authenticated as a <strong className="text-white">STUDENT</strong> ({user.fullName} · {user.regNo}).
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
          Student accounts cannot access coordinator and moderator functionality. Attempting to modify client parameters
          will not grant administrative authorization on the server.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onNavigateDashboard}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
          </button>
          <button
            onClick={() => onOpenAuth('coordinator-login')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg transition-colors cursor-pointer"
          >
            Sign In with Coordinator Account
          </button>
        </div>
      </div>
    );
  }

  // Filtered inspect records
  const filteredUsers = dbInspect?.users.filter(u =>
    u.fullName?.toLowerCase().includes(dbSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(dbSearch.toLowerCase()) ||
    u.regNo?.toLowerCase().includes(dbSearch.toLowerCase())
  ) || [];

  // Case 3: Authorized COORDINATOR View
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative p-1 rounded-xl bg-slate-950 border border-emerald-500/40 shrink-0">
            <img
              src={cyberfortLogo}
              alt="CyberFort Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 object-contain rounded"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Operations Command · Active Coordinator
            </div>
            <h2 className="text-2xl font-black text-white mt-0.5 font-sans">
              Coordinator & Database Command
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Authenticated: <strong className="text-emerald-300">{user.fullName}</strong> ({user.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-mono text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            title="Download CSV Leaderboard"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
          </button>
          <button
            onClick={handleDownloadDatabase}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-600/30 font-bold"
            title="Download full JSON database"
          >
            <Database className="w-3.5 h-3.5" /> Download Database
          </button>
          <button
            onClick={fetchCoordinatorData}
            className="p-2 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Refresh database state"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/60 border-red-500/50 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab('participants')}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'participants'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Participants & Audits ({participants.length})
        </button>
        <button
          onClick={() => setActiveTab('user-management')}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'user-management'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCog className="w-4 h-4" /> USER MANAGEMENT ({managedUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'database'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" /> Database & Records
        </button>
        <button
          onClick={() => setActiveTab('ai-generator')}
          className={`pb-3 px-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ai-generator'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Challenge Engine
        </button>
      </div>

      {/* TAB 1: PARTICIPANTS AUDIT */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-emerald-500/20 overflow-hidden shadow-2xl space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm font-sans flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Participant Audit Records ({participants.length})
              </h3>
              <span className="text-xs font-mono text-emerald-400/80">Live Server State</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Reg No</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Challenge ID</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Clues</th>
                    <th className="py-3 px-3 text-right">Score</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {participants.map((p) => {
                    const att = p.attempt;
                    const isCompleted = att?.completed;
                    const isExpired = att?.expired;
                    const cluesCount = att?.collectedClues?.length || 0;

                    return (
                      <tr key={p.uid} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-3 text-cyan-400 font-bold">{p.regNo || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block font-sans">{p.fullName}</span>
                          <span className="text-[10px] text-slate-500">{p.email}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              p.role === 'COORDINATOR'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px]">
                          <div className="text-slate-200 font-semibold">{att?.environmentTheme || att?.challengeId || 'UNASSIGNED'}</div>
                          {att?.challengeId && (
                            <div className="text-[10px] text-cyan-400/80">{att.challengeId}</div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                : isExpired
                                ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                                : att
                                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isCompleted ? 'COMPLETED' : isExpired ? 'EXPIRED' : att ? 'IN PROGRESS' : 'NOT STARTED'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 tabular-nums">{cluesCount} / 3</td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-bold tabular-nums">
                          {att?.score ?? 0} PTS
                        </td>
                        <td className="py-3 px-3 text-right">
                          {att && (
                            <button
                              onClick={() => setResetModalTarget(p)}
                              className="px-2.5 py-1 rounded bg-red-950/60 border border-red-500/40 hover:bg-red-900 text-red-300 text-[10px] font-mono transition-colors cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs History */}
          {auditLogs.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-slate-300">
                <History className="w-4 h-4 text-emerald-400" /> Official Coordinator Audit Trail
              </h4>
              <div className="divide-y divide-slate-800/80 text-xs font-mono">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-red-400 font-bold">[{log.action}]</span>{' '}
                      <span className="text-white">Target UID: {log.targetUid}</span> —{' '}
                      <span className="text-slate-400">"{log.reason}"</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Moderator: {log.moderator} · {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1.5: USER MANAGEMENT DASHBOARD */}
      {activeTab === 'user-management' && (
        <div className="space-y-6">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Users</span>
              <div className="text-xl font-bold text-white tabular-nums">
                {userSummary?.total ?? managedUsers.length}
              </div>
              <span className="text-[10px] text-slate-500 block">Registered Accounts</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1 shadow-lg">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block">Students</span>
              <div className="text-xl font-bold text-cyan-300 tabular-nums">
                {userSummary?.students ?? managedUsers.filter(u => u.role === 'STUDENT').length}
              </div>
              <span className="text-[10px] text-cyan-500/70 block">CTF Participants</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1 shadow-lg">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Coordinators</span>
              <div className="text-xl font-bold text-emerald-300 tabular-nums">
                {userSummary?.coordinators ?? managedUsers.filter(u => u.role === 'COORDINATOR').length}
              </div>
              <span className="text-[10px] text-emerald-500/70 block">Event Staff</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/40 space-y-1 shadow-lg">
              <span className="text-[10px] text-purple-400 uppercase tracking-wider block">Administrators</span>
              <div className="text-xl font-bold text-purple-300 tabular-nums">
                {userSummary?.administrators ?? managedUsers.filter(u => u.role === 'ADMINISTRATOR').length}
              </div>
              <span className="text-[10px] text-purple-400/70 block">Root Authorizers</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-red-500/30 space-y-1 shadow-lg col-span-2 sm:col-span-1">
              <span className="text-[10px] text-red-400 uppercase tracking-wider block">Deactivated</span>
              <div className="text-xl font-bold text-red-400 tabular-nums">
                {userSummary?.deactivated ?? managedUsers.filter(u => u.status === 'DEACTIVATED').length}
              </div>
              <span className="text-[10px] text-red-400/70 block">Suspended Access</span>
            </div>
          </div>

          {/* User Management Container */}
          <div className="glass-panel rounded-2xl border border-purple-500/25 overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <UserCog className="w-4 h-4 text-purple-400" /> Database User Administration
                </div>
                <h3 className="text-lg font-bold text-white mt-1 font-sans">
                  User Management & Role Access Control
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live user identities managed in <code className="text-emerald-300 font-mono text-[11px]">/data/cyberfort_db.json</code>. Authorized administrators can assign coordinator roles, deactivate accounts, or permanently purge users.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchCoordinatorData}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Refresh Registry
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 font-mono text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search student name, email, UID, or reg no..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-xs"
                />
                {userSearch && (
                  <button
                    onClick={() => setUserSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 p-1 rounded-xl">
                  <span className="text-[10px] text-slate-500 px-2 flex items-center gap-1 font-semibold uppercase">
                    <Filter className="w-3 h-3 text-slate-400" /> Role:
                  </span>
                  {(['ALL', 'STUDENT', 'COORDINATOR', 'ADMINISTRATOR'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        roleFilter === r
                          ? r === 'ADMINISTRATOR'
                            ? 'bg-purple-900/70 text-purple-300 border border-purple-500/40'
                            : r === 'COORDINATOR'
                            ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/40'
                            : r === 'STUDENT'
                            ? 'bg-cyan-900/70 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r === 'ALL' ? 'All Roles' : r}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 p-1 rounded-xl">
                  <span className="text-[10px] text-slate-500 px-2 font-semibold uppercase">Status:</span>
                  {(['ALL', 'ACTIVE', 'DEACTIVATED'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        statusFilter === s
                          ? s === 'ACTIVE'
                            ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/40'
                            : s === 'DEACTIVATED'
                            ? 'bg-red-900/70 text-red-300 border border-red-500/40'
                            : 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s === 'ALL' ? 'All Status' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Managed Users Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">User ID</th>
                    <th className="py-3 px-3">Account Role</th>
                    <th className="py-3 px-3">Registration Date</th>
                    <th className="py-3 px-3">Account Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {managedUsers
                    .filter((u) => {
                      const q = userSearch.trim().toLowerCase();
                      const matchesSearch =
                        !q ||
                        u.fullName?.toLowerCase().includes(q) ||
                        u.email?.toLowerCase().includes(q) ||
                        u.regNo?.toLowerCase().includes(q) ||
                        u.uid?.toLowerCase().includes(q);
                      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
                      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
                      return matchesSearch && matchesRole && matchesStatus;
                    })
                    .map((u) => {
                      const isCurrentAdmin = u.uid === user?.uid;
                      const isDeactivated = u.status === 'DEACTIVATED';
                      const regDateFormatted = u.registeredAt
                        ? new Date(u.registeredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) + ' ' + new Date(u.registeredAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'System Seeded';

                      return (
                        <tr
                          key={u.uid}
                          className={`hover:bg-slate-900/40 transition-colors ${
                            isDeactivated ? 'opacity-70 bg-red-950/10' : ''
                          }`}
                        >
                          {/* Student Name */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  u.role === 'ADMINISTRATOR'
                                    ? 'bg-purple-950 border border-purple-500/50 text-purple-300'
                                    : u.role === 'COORDINATOR'
                                    ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                                    : 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                                }`}
                              >
                                {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span className="font-bold text-white block font-sans">
                                  {u.fullName} {isCurrentAdmin && <span className="text-[10px] text-purple-400 font-mono">(You)</span>}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {u.regNo || 'NO REG NO'} · {u.yearOfStudy || 'First Year'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Email Address */}
                          <td className="py-3 px-3">
                            <span className="text-slate-300 font-mono text-xs">{u.email}</span>
                          </td>

                          {/* User ID */}
                          <td className="py-3 px-3 font-mono">
                            <div className="flex items-center gap-1.5">
                              <code className="text-slate-400 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                {u.uid}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(u.uid);
                                  setNotification({ text: `Copied UID ${u.uid} to clipboard.`, type: 'success' });
                                }}
                                className="text-slate-500 hover:text-slate-300 cursor-pointer"
                                title="Copy UID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Account Role */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === 'ADMINISTRATOR'
                                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50'
                                  : u.role === 'COORDINATOR'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                                  : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                              }`}
                            >
                              {u.role === 'ADMINISTRATOR' ? (
                                <Shield className="w-3 h-3 text-purple-400" />
                              ) : u.role === 'COORDINATOR' ? (
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <UserIcon className="w-3 h-3 text-cyan-400" />
                              )}
                              {u.role}
                            </span>
                          </td>

                          {/* Registration Date */}
                          <td className="py-3 px-3 text-slate-400 text-[11px]">
                            {regDateFormatted}
                          </td>

                          {/* Account Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-red-950/80 text-red-400 border border-red-500/50'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'
                                }`}
                              />
                              {u.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Change Role Action */}
                              <button
                                onClick={() => handleOpenRoleModal(u)}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-500/60 text-purple-300 hover:text-white text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                                title="Change User Role"
                              >
                                <UserCog className="w-3 h-3" /> Role
                              </button>

                              {/* Deactivate / Reactivate Action */}
                              <button
                                onClick={() => handleOpenStatusModal(u)}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-amber-950/60 border-amber-500/40 hover:bg-amber-900 text-amber-300'
                                    : 'bg-emerald-950/60 border-emerald-500/40 hover:bg-emerald-900 text-emerald-300'
                                }`}
                                title={u.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account'}
                              >
                                {u.status === 'ACTIVE' ? (
                                  <>
                                    <UserX className="w-3 h-3" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" /> Reactivate
                                  </>
                                )}
                              </button>

                              {/* Permanent Delete Action */}
                              <button
                                onClick={() => handleOpenDeleteModal(u)}
                                disabled={isCurrentAdmin}
                                className="p-1 rounded-lg bg-red-950/40 border border-red-500/30 hover:bg-red-900 text-red-400 hover:text-red-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title={isCurrentAdmin ? 'Cannot delete your own administrator account' : 'Permanently Delete User Account'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-purple-500/20 text-slate-400 font-mono text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  Protected Administration: All role transitions and account deactivations are enforced server-side, preventing students from self-assigning privileges and protecting the last authorized administrator.
                </span>
              </div>
              <span className="text-slate-500 shrink-0 ml-2">Audit-Logged</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE & RECORDS EXPLORER */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Database Storage Details Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <HardDrive className="w-4 h-4 text-cyan-400" /> Storage Architecture & Access Location
                </div>
                <h3 className="text-lg font-bold text-white mt-1 font-sans">
                  Server Database: <code className="text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/30 font-mono text-sm">/data/cyberfort_db.json</code>
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  All users, passwords, sessions, randomized challenge variants, attempts, and audit trails
                  are synchronized into this persistent database file on disk. You can access it directly in the workspace
                  or download raw JSON backups and CSV exports below.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDownloadDatabase}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Download className="w-3.5 h-3.5" /> Download Backup (.json)
                </button>
                <button
                  onClick={handleCopyDatabaseJson}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiedDb ? 'Copied!' : 'Copy Summary'}
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            {dbInspect && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Accounts</span>
                  <span className="text-lg font-bold text-white tabular-nums">{dbInspect.summary.totalUsers}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    {dbInspect.summary.studentCount} Students · {dbInspect.summary.coordinatorCount} Coords
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Challenge Bank</span>
                  <span className="text-lg font-bold text-cyan-400 tabular-nums">{dbInspect.summary.totalChallenges}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Randomized Scenarios</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Attempts Logged</span>
                  <span className="text-lg font-bold text-emerald-400 tabular-nums">{dbInspect.summary.totalAttempts}</span>
                  <span className="text-[10px] text-emerald-300 block mt-0.5">
                    {dbInspect.summary.completedAttempts} Extractions Done
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Active Sessions</span>
                  <span className="text-lg font-bold text-white tabular-nums">{dbInspect.summary.activeSessions}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {dbInspect.summary.auditLogsCount} Audit Actions
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive User Records Directory */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="font-bold text-white text-sm font-sans flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Database Accounts Directory ({filteredUsers.length})
              </h4>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  placeholder="Search accounts in database..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">UID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Reg No</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-900/30">
                      <td className="py-2 px-3 text-slate-500 text-[11px]">{u.uid}</td>
                      <td className="py-2 px-3 text-white font-bold">{u.fullName}</td>
                      <td className="py-2 px-3 text-slate-300">{u.email}</td>
                      <td className="py-2 px-3 text-cyan-400">{u.regNo}</td>
                      <td className="py-2 px-3 text-slate-400">{u.yearOfStudy}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            u.role === 'COORDINATOR'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GEMINI AI CHALLENGE GENERATOR */}
      {activeTab === 'ai-generator' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Server-Side Gemini AI Challenge Generator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Draft fresh 3-clue forensic CTF scenarios with verified location consistency using Gemini 3.8 Flash.
                </p>
              </div>
              <button
                onClick={handleGenerateVariant}
                disabled={draftingAI}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-black font-bold font-mono text-xs rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {draftingAI ? 'Drafting Challenge...' : 'Generate New Variant Draft'}
              </button>
            </div>

            {/* Display generated draft if available */}
            {latestDraft && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300 font-bold">{latestDraft.title}</span>
                  <span className="text-[10px] bg-yellow-950 text-yellow-400 border border-yellow-500/40 px-2 py-0.5 rounded">
                    DRAFT GENERATED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block">Target Location Phrase:</span>
                    <span className="text-white font-bold">{latestDraft.commonLocationPhrase}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Authoritative Flag:</span>
                    <code className="text-cyan-300 font-bold">{latestDraft.flag}</code>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <p><strong>Workstation:</strong> {latestDraft.workstationClue}</p>
                  <p><strong>CCTV Screen:</strong> {latestDraft.cctvClue}</p>
                  <p><strong>Access Terminal:</strong> {latestDraft.accessLogClue}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400">
                    Distractors: {latestDraft.distractors?.join(', ')}
                  </span>
                  <button
                    onClick={() => handleActivateDraft(latestDraft.draftId)}
                    disabled={activatingDraft}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-[11px] rounded transition-colors cursor-pointer"
                  >
                    {activatingDraft ? 'Activating...' : 'Add to Active Challenge Pool'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReset}
            className="glass-panel w-full max-w-md rounded-2xl border border-red-500/50 p-6 shadow-2xl relative space-y-4 font-mono text-xs"
          >
            <button
              type="button"
              onClick={() => setResetModalTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500 flex items-center justify-center text-red-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Authorize Attempt Reset</h3>
                <p className="text-[11px] text-slate-400">{resetModalTarget.fullName} ({resetModalTarget.regNo})</p>
              </div>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              Clearing this attempt will wipe the student's assigned challenge, collected clues, scores, and timer.
              A mandatory justification is required for the permanent audit trail.
            </p>

            <div>
              <label className="block text-slate-300 mb-1">Official Audit Justification</label>
              <input
                type="text"
                required
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                placeholder="e.g. Workstation network disruption during final round"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalTarget(null)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetSubmitting || !resetReason.trim()}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {resetSubmitting ? 'Clearing...' : 'Confirm Reset'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Role Modal */}
      {roleModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmRoleChange}
            className="glass-panel w-full max-w-lg rounded-2xl border border-purple-500/50 p-6 shadow-2xl relative space-y-4 font-mono text-xs"
          >
            <button
              type="button"
              onClick={() => setRoleModalTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500 flex items-center justify-center text-purple-400">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Assign User Account Role</h3>
                <p className="text-[11px] text-slate-400">
                  {roleModalTarget.fullName} ({roleModalTarget.email})
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>User ID:</span>
                <code className="text-slate-200">{roleModalTarget.uid}</code>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Role:</span>
                <span className="font-bold text-white">{roleModalTarget.role}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className={roleModalTarget.status === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {roleModalTarget.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-bold uppercase tracking-wider text-[10px]">
                Select Target Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['STUDENT', 'COORDINATOR', 'ADMINISTRATOR'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedRole === r
                        ? r === 'ADMINISTRATOR'
                          ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-md shadow-purple-950'
                          : r === 'COORDINATOR'
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-950'
                          : 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{r}</span>
                      {selectedRole === r && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[9px] text-slate-400 leading-tight">
                      {r === 'STUDENT'
                        ? 'CTF player only'
                        : r === 'COORDINATOR'
                        ? 'Moderator access'
                        : 'Full admin rights'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Audit Justification</label>
              <input
                type="text"
                value={roleReason}
                onChange={(e) => setRoleReason(e.target.value)}
                placeholder="e.g. Appointed lead tournament coordinator for 2026 round"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-400 text-xs"
              />
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              * Security Notice: Demoting an administrator is protected on the server. The last authorized administrator cannot be demoted. Role changes are instantly recorded in the permanent audit trail.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoleModalTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={roleSubmitting || selectedRole === roleModalTarget.role}
                className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-600/30"
              >
                {roleSubmitting ? 'Updating Role...' : `Confirm Assign ${selectedRole}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deactivate / Reactivate Modal */}
      {statusModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmStatusChange}
            className={`glass-panel w-full max-w-md rounded-2xl border p-6 shadow-2xl relative space-y-4 font-mono text-xs ${
              statusModalTarget.status === 'ACTIVE' ? 'border-amber-500/50' : 'border-emerald-500/50'
            }`}
          >
            <button
              type="button"
              onClick={() => setStatusModalTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                  statusModalTarget.status === 'ACTIVE'
                    ? 'bg-amber-950 border-amber-500 text-amber-400'
                    : 'bg-emerald-950 border-emerald-500 text-emerald-400'
                }`}
              >
                {statusModalTarget.status === 'ACTIVE' ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {statusModalTarget.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {statusModalTarget.fullName} ({statusModalTarget.email})
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Account:</span>
                <span className="text-white font-bold">{statusModalTarget.fullName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Email:</span>
                <span className="text-slate-300">{statusModalTarget.email}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>UID:</span>
                <code className="text-slate-400">{statusModalTarget.uid}</code>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Role:</span>
                <span className="text-slate-200">{statusModalTarget.role}</span>
              </div>
            </div>

            {statusModalTarget.status === 'ACTIVE' ? (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 space-y-1 text-[11px]">
                <p className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Deactivation Impact Notice:
                </p>
                <p className="leading-relaxed">
                  Deactivating this account will immediately revoke all active session tokens and prevent the user from logging in or submitting flags.
                  Competition scores and submission history are preserved in the database.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200/90 space-y-1 text-[11px]">
                <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reactivation Notice:
                </p>
                <p className="leading-relaxed">
                  Reactivating this account will restore full login access and enable participation with their existing credentials.
                </p>
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1">Reason / Note for Audit Trail</label>
              <input
                type="text"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="e.g. Temporary suspension pending investigation"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={statusSubmitting}
                className={`flex-1 py-2.5 rounded-lg text-white font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-lg ${
                  statusModalTarget.status === 'ACTIVE'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                {statusSubmitting
                  ? 'Processing...'
                  : statusModalTarget.status === 'ACTIVE'
                  ? 'Confirm Deactivation'
                  : 'Confirm Reactivation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deleteModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmDelete}
            className="glass-panel w-full max-w-md rounded-2xl border border-red-500/60 p-6 shadow-2xl relative space-y-4 font-mono text-xs"
          >
            <button
              type="button"
              onClick={() => setDeleteModalTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Permanent Account Deletion</h3>
                <p className="text-[11px] text-red-400">IRREVERSIBLE DATABASE ACTION</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-[11px] space-y-1.5 leading-relaxed">
              <p className="font-bold text-white">
                You are about to permanently purge the account:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                <li><strong>Name:</strong> {deleteModalTarget.fullName}</li>
                <li><strong>Email:</strong> {deleteModalTarget.email}</li>
                <li><strong>User ID:</strong> {deleteModalTarget.uid}</li>
                <li><strong>Role:</strong> {deleteModalTarget.role}</li>
              </ul>
              <p className="text-red-300 pt-1">
                This deletes the authentication identity, credentials, active sessions, and competition attempt from /data/cyberfort_db.json. This cannot be undone.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                Type <strong className="text-red-400">DELETE</strong> or the user's email to confirm:
              </label>
              <input
                type="text"
                required
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder={deleteModalTarget.email}
                className="w-full bg-slate-900 border border-red-500/50 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Deletion Reason (Audit Record)</label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Student withdrew enrollment / duplicate entry"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-400 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  deleteSubmitting ||
                  (deleteConfirmationText.trim().toLowerCase() !== deleteModalTarget.email.toLowerCase() &&
                    deleteConfirmationText.trim().toUpperCase() !== 'DELETE')
                }
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-40 cursor-pointer shadow-lg shadow-red-600/30"
              >
                {deleteSubmitting ? 'Purging...' : 'Permanently Delete'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
