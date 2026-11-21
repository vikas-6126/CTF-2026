import React, { useState, useEffect } from 'react';
import { UserProfile, Attempt, Challenge, Clue, BackgroundNode } from '../types';
import labChamberImage from '../assets/images/investigation_chamber_lab_1792418981947.jpg';
import {
  Monitor,
  Eye,
  Key,
  Server,
  Box,
  FileText,
  CheckCircle2,
  HelpCircle,
  Flag,
  X,
  AlertCircle,
  Lock,
  Unlock,
  Sparkles,
  Clock,
  Terminal as TerminalIcon,
  Send,
  ShieldAlert
} from 'lucide-react';

interface InvestigationChamberProps {
  user: UserProfile;
  attempt: Attempt;
  challenge: Challenge;
  token: string;
  onUpdateAttempt: (updated: Attempt) => void;
  onSuccess: (completedAttempt: Attempt) => void;
  onTimeExpired: () => void;
}

export const InvestigationChamber: React.FC<InvestigationChamberProps> = ({
  user,
  attempt,
  challenge,
  token,
  onUpdateAttempt,
  onSuccess,
  onTimeExpired
}) => {
  const [activeModal, setActiveModal] = useState<{
    title: string;
    text: string;
    snippet?: string;
    isClue: boolean;
    clueId?: string;
  } | null>(null);

  const [flagInput, setFlagInput] = useState('');
  const [submittingFlag, setSubmittingFlag] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [revealedHints, setRevealedHints] = useState<Array<{ number: number; label: string; text: string }>>([]);
  const [requestingHint, setRequestingHint] = useState(false);

  const PROGRESSIVE_HINTS = [
    'Review all three evidence records carefully. Pay attention to the information that appears in more than one record.',
    'Compare the metadata fields across the incident records. One category contains a repeated identifier.',
    'The repeated identifier is relevant to the final flag. Preserve its wording and replace spaces with underscores when formatting your submission.'
  ];

  useEffect(() => {
    if (attempt.hintsUsed > 0 && revealedHints.length === 0) {
      const restored = PROGRESSIVE_HINTS.slice(0, attempt.hintsUsed).map((text, idx) => ({
        number: idx + 1,
        label: `HINT ${idx + 1}`,
        text
      }));
      setRevealedHints(restored);
    }
  }, [attempt.hintsUsed]);

  // --- 25-Minute Countdown Timer Implementation ---
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    return Math.max(0, Math.round((attempt.expiresAt - Date.now()) / 1000));
  });

  const isExpired = remainingSeconds <= 0 || attempt.expired;

  useEffect(() => {
    if (attempt.completed) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, Math.round((attempt.expiresAt - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        if (!attempt.expired) {
          onUpdateAttempt({ ...attempt, expired: true });
        }
        onTimeExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt.expiresAt, attempt.completed]);

  // Format mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer Color Class: Normal Cyan, Amber <= 5min (300s), Red <= 1min (60s)
  const getTimerColorClass = () => {
    if (remainingSeconds <= 60) return 'text-red-400 border-red-500/50 bg-red-950/40 animate-pulse';
    if (remainingSeconds <= 300) return 'text-amber-400 border-amber-500/50 bg-amber-950/40';
    return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
  };

  // Calculate percentage of 25 minutes (1500 seconds)
  const timerPercentage = Math.min(100, Math.max(0, (remainingSeconds / 1500) * 100));

  // Helper for choosing Lucide icon based on iconType
  const getIconForType = (type?: string, isClue?: boolean) => {
    switch (type) {
      case 'terminal':
      case 'monitor':
        return Monitor;
      case 'eye':
      case 'cctv':
      case 'camera':
        return Eye;
      case 'key':
      case 'rfid':
      case 'badge':
        return Key;
      case 'network':
      case 'server':
      case 'rack':
        return Server;
      case 'box':
      case 'safe':
      case 'case':
        return Box;
      case 'file':
      case 'ledger':
      case 'cabinet':
      case 'document':
        return FileText;
      case 'shield':
      case 'lock':
        return Lock;
      default:
        return isClue ? Monitor : Server;
    }
  };

  type HotspotNode =
    | {
        id: string;
        isClue: true;
        name: string;
        icon: React.ComponentType<{ className?: string }>;
        position: string;
        clueData: Clue;
      }
    | {
        id: string;
        isClue: false;
        name: string;
        icon: React.ComponentType<{ className?: string }>;
        position: string;
        nodeData: BackgroundNode;
      };

  // Dynamic hotspot mappings honoring each environment's unique layout, placement, and icons
  const defaultCluePositions = ['top-[44%] left-[28%]', 'top-[16%] right-[24%]', 'top-[42%] right-[5%]'];
  const defaultBgPositions = ['top-[22%] left-[46%]', 'bottom-[12%] left-[12%]', 'bottom-[8%] right-[32%]'];

  const clueNodes: HotspotNode[] = challenge.clues.map((c, idx) => ({
    id: c.id,
    isClue: true,
    name: c.name,
    icon: getIconForType(c.iconType, true),
    position: c.position || defaultCluePositions[idx % defaultCluePositions.length],
    clueData: c
  }));

  const bgNodes: HotspotNode[] = challenge.backgroundNodes.map((b, idx) => ({
    id: b.id,
    isClue: false,
    name: b.name,
    icon: getIconForType(b.iconType, false),
    position: b.position || defaultBgPositions[idx % defaultBgPositions.length],
    nodeData: b
  }));

  const nodes: HotspotNode[] = [...clueNodes, ...bgNodes];

  const allCluesCollected = attempt.collectedClues.length >= 3;

  const handleInspect = async (node: HotspotNode) => {
    if (isExpired) return;

    if (node.isClue) {
      setActiveModal({
        title: node.clueData.name,
        text: node.clueData.text,
        snippet: node.clueData.evidenceSnippet,
        isClue: true,
        clueId: node.id
      });

      if (!attempt.collectedClues.includes(node.id)) {
        try {
          const res = await fetch('/api/attempt/collect-clue', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ clueKey: node.id })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            onUpdateAttempt({
              ...attempt,
              collectedClues: data.collectedClues,
              score: data.score
            });
            if (data.allCluesFound) {
              setStatusMessage({
                text: 'All 3 incident clues collected (+30 PTS)! Correlate the shared signature across evidence nodes and enter your flag into the terminal.',
                type: 'success'
              });
            }
          } else if (data.expired) {
            onUpdateAttempt({ ...attempt, expired: true });
          }
        } catch (err) {
          console.error('Failed to record clue:', err);
        }
      }
    } else {
      setActiveModal({
        title: node.nodeData.name,
        text: node.nodeData.text,
        isClue: false
      });
    }
  };

  const handleRequestHint = async () => {
    if (isExpired || requestingHint || attempt.hintsUsed >= 3) return;
    setRequestingHint(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/attempt/use-hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        const newHint = {
          number: data.hintNumber,
          label: data.hintLabel || `HINT ${data.hintNumber}`,
          text: data.hintText
        };
        setRevealedHints(prev => {
          const filtered = prev.filter(h => h.number !== newHint.number);
          return [...filtered, newHint].sort((a, b) => a.number - b.number);
        });
        onUpdateAttempt({
          ...attempt,
          hintsUsed: data.hintsUsed
        });
        setStatusMessage({
          text: `${newHint.label} unlocked. 5 points deducted from final flag completion score.`,
          type: 'info'
        });
      } else {
        if (data.expired) {
          onUpdateAttempt({ ...attempt, expired: true });
        }
        setStatusMessage({ text: data.error || 'No hints available.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Failed to retrieve hint telemetry.', type: 'error' });
    } finally {
      setRequestingHint(false);
    }
  };

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim() || isExpired) return;
    setSubmittingFlag(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/attempt/submit-flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ submittedFlag: flagInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setStatusMessage({
          text: 'FLAG CONFIRMED! Initializing extraction video protocol...',
          type: 'success'
        });
        onUpdateAttempt(data.attempt);
        setTimeout(() => {
          onSuccess(data.attempt);
        }, 600);
      } else {
        if (data.expired) {
          onUpdateAttempt({ ...attempt, expired: true });
        }
        setStatusMessage({
          text: data.message || data.error || 'Flag rejected. The pattern does not match the shared signature across your assigned incident logs. Check your findings and formatting.',
          type: 'error'
        });
      }
    } catch (err) {
      setStatusMessage({ text: 'Flag submission failed.', type: 'error' });
    } finally {
      setSubmittingFlag(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* Top Status Bar: Venue, Clues, Timer, and Hints */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold tracking-wide">
              {challenge.venueLabel}
            </span>
          </div>

          <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-2 text-slate-300">
            <span>Discovered Evidence:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {attempt.collectedClues.length} of 3
            </span>
          </div>

          <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-2 text-slate-300">
            <span>Current Score:</span>
            <span className="text-cyan-400 font-bold tabular-nums">
              {attempt.score} / 100 PTS
            </span>
          </div>
        </div>

        {/* 25-Minute Countdown Timer & Hint Trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex flex-col items-end">
            <div
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-mono text-xs font-bold transition-all shadow-sm ${getTimerColorClass()}`}
              title="Official 25-minute challenge countdown"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isExpired ? '00:00 EXPIRED' : formatTime(remainingSeconds)}</span>
            </div>
            {/* Countdown Progress Track */}
            <div className="w-full bg-slate-900 h-1 rounded-full mt-1 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${
                  remainingSeconds <= 60
                    ? 'bg-red-500'
                    : remainingSeconds <= 300
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>

          {attempt.hintsUsed < 3 && !attempt.completed && (
            <button
              onClick={handleRequestHint}
              disabled={requestingHint || isExpired}
              className="px-3.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Reveal next progressive hint (-5 score penalty)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{requestingHint ? 'Decryption...' : `Hint (${attempt.hintsUsed + 1}/3)`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progressive Hints List (Reveals progressively upon request, never displays solution) */}
      {revealedHints.length > 0 && (
        <div className="space-y-2.5 transition-all duration-300">
          {revealedHints.map((hint) => (
            <div
              key={hint.number}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs font-mono text-emerald-200 flex items-start justify-between gap-3 shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 font-bold text-xs">
                  {hint.number}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-300 text-xs tracking-wider uppercase">
                      {hint.label}
                    </span>
                    <span className="text-[10px] text-slate-400">· REASONING GUIDANCE</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans text-xs">
                    {hint.text}
                  </p>
                  <span className="text-[10px] text-emerald-400/80 block">
                    Notice: 5 points deducted from final flag completion score per hint used.
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Incident Narrative Brief Banner */}
      {challenge.incidentNarrative && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 shadow-md">
          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 animate-ping" />
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="font-bold">INCIDENT TELEMETRY // {challenge.environmentTheme || 'INVESTIGATION ENCLAVE'}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{challenge.themeStyle?.hudTag || 'SECTOR_ONLINE'}</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {challenge.incidentNarrative}
            </p>
          </div>
        </div>
      )}

      {/* 2.5D Interactive Forensics Chamber Viewport */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl glass-panel aspect-[16/9] max-h-[520px] bg-slate-950 select-none">
        <img
          src={labChamberImage}
          alt="Forensics Chamber View"
          referrerPolicy="no-referrer"
          style={
            challenge.themeStyle?.bgHue
              ? {
                  filter: `hue-rotate(${challenge.themeStyle.bgHue.replace(/[^0-9deg]/g, '') || '0deg'}) brightness(0.9) contrast(1.05)`
                }
              : { filter: 'brightness(0.9) contrast(1.05)' }
          }
          className="w-full h-full object-cover object-center pointer-events-none transition-all duration-700"
        />

        {/* Ambient environment atmospheric color overlay */}
        <div
          className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${
            challenge.themeStyle?.accentColor === 'emerald'
              ? 'bg-emerald-950/20'
              : challenge.themeStyle?.accentColor === 'violet'
              ? 'bg-violet-950/25'
              : challenge.themeStyle?.accentColor === 'teal'
              ? 'bg-teal-950/20'
              : 'bg-cyan-950/20'
          }`}
        />

        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

        {/* Dynamic Chamber HUD Badges */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-700/60 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-200 uppercase">
            {challenge.themeStyle?.hudTag || 'HUD_ACTIVE'}
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-700/60 backdrop-blur-md hidden sm:block">
          <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-semibold">
            {challenge.environmentTheme || 'FORENSIC CHAMBER'}
          </span>
        </div>

        {/* Hotspot Interactive Nodes */}
        {nodes.map((node) => {
          const isCollected = node.isClue && attempt.collectedClues.includes(node.id);
          const IconComponent = node.icon;

          return (
            <div
              key={node.id}
              style={{ position: 'absolute' }}
              className={`${node.position} z-20 -translate-x-1/2 -translate-y-1/2`}
            >
              <button
                onClick={() => handleInspect(node)}
                disabled={isExpired}
                className={`interactive-node group p-2 sm:p-2.5 rounded-xl flex items-center gap-2 border transition-all duration-300 backdrop-blur-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isCollected
                    ? 'bg-emerald-950/85 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/30'
                    : node.isClue
                    ? 'bg-slate-950/85 border-cyan-500/40 text-slate-300 hover:border-emerald-400 hover:text-emerald-200'
                    : 'bg-slate-950/70 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isCollected ? 'bg-emerald-400 text-black' : 'bg-slate-900 text-slate-300 group-hover:text-emerald-300'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="hidden sm:block text-left font-mono">
                  <div className="text-[11px] font-bold tracking-tight text-white group-hover:text-emerald-300">
                    {node.name}
                  </div>
                  <div className="text-[9px] text-slate-400">
                    {isCollected ? 'EVIDENCE LOGGED' : node.isClue ? 'INVESTIGATE NODE' : 'INSPECT'}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-red-950/60 border-red-500/50 text-red-300'
              : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Two-Column: Signal Correlation & Capture The Flag Terminal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* EVIDENCE COLLECTION Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm font-sans flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> EVIDENCE COLLECTION
            </h4>
            <span className="text-xs font-mono text-emerald-400/90 tabular-nums">
              {attempt.collectedClues.length}/3 Discovered
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs select-none pointer-events-none">
            {challenge.clues.map((clue, idx) => {
              const collected = attempt.collectedClues.includes(clue.id);
              const clueNumber = `CLUE ${idx + 1}`;
              return (
                <div
                  key={clue.id}
                  className={`p-3.5 rounded-xl border select-none pointer-events-none transition-colors flex items-center ${
                    collected
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 font-bold'
                  }`}
                >
                  <span className={`tracking-wider ${collected ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {clueNumber}
                  </span>
                </div>
              );
            })}
          </div>

          {allCluesCollected && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 font-mono text-xs text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> ALL 3 SIGNALS DISCOVERED · TERMINAL UNLOCKED
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                Correlate the repeating shared signature across your 3 evidence logs to assemble your flag.
              </p>
            </div>
          )}
        </div>

        {/* Capture The Flag Terminal (The ONLY answer submission method) */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/25 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white text-sm font-sans flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-emerald-400" /> Capture The Flag Terminal
            </h4>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              {allCluesCollected ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" /> AUTHORIZED
                </span>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> LOCKED
                </span>
              )}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Correlate the evidence across all three incident nodes and determine the location pattern required to construct your flag.
          </p>

          <div className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg inline-block">
            <span className="text-slate-400">FLAG FORMAT:</span> <span className="font-bold text-emerald-300">CYBERFORT{'{DESTINATION_PATTERN}'}</span>
          </div>

          {!allCluesCollected ? (
            /* Locked State */
            <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono text-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/60 mx-auto flex items-center justify-center text-slate-500 shadow-inner">
                <Lock className="w-6 h-6 text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-200 font-bold tracking-wide">
                  Investigate all evidence nodes to unlock terminal access.
                </p>
                <p className="text-[11px] text-slate-500">
                  {3 - attempt.collectedClues.length} remaining clue node{3 - attempt.collectedClues.length === 1 ? '' : 's'} required to activate input.
                </p>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 max-w-xs mx-auto">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${(attempt.collectedClues.length / 3) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            /* Unlocked Live Submission State */
            <form onSubmit={handleSubmitFlag} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-200 font-bold flex items-center justify-between">
                  <span>Authoritative Flag Input</span>
                  <span className="text-[10px] text-emerald-400">Terminal Ready</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-emerald-400 font-bold select-none">$</span>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    disabled={isExpired || submittingFlag}
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    placeholder="e.g. CYBERFORT{YOUR_DISCOVERED_PATTERN}"
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl pl-8 pr-3 py-3 text-white tracking-wider focus:outline-none focus:border-emerald-400 font-mono disabled:opacity-40 text-xs shadow-inner focus:ring-1 focus:ring-emerald-400/40"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  FLAG FORMAT: CYBERFORT&#123;DESTINATION_PATTERN&#125; · Replace spaces with underscores inside curly brackets. Case insensitive.
                </span>
              </div>

              <button
                type="submit"
                disabled={submittingFlag || !flagInput.trim() || isExpired}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submittingFlag ? 'Verifying Authorization...' : 'SUBMIT FLAG'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Forensic Inspection Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-emerald-500/40 p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">
                  {activeModal.isClue ? 'PRIMARY EVIDENCE LOG' : 'SYSTEM TELEMETRY'}
                </span>
                <h3 className="font-bold text-white text-base font-sans">{activeModal.title}</h3>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed">
              {activeModal.text}
            </div>

            {activeModal.snippet && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                <span className="text-slate-400 block text-[10px] mb-0.5">RAW EVIDENCE SNIPPET:</span>
                {activeModal.snippet}
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs transition-colors cursor-pointer"
            >
              Dismiss Log Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
