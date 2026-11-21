import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Download, Search, RefreshCw, Medal } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<'all' | 'First Year' | 'Second Year'>('all');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setEntries(data.leaderboard || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.displayName.toLowerCase().includes(search.toLowerCase()) ||
      entry.yearOfStudy.toLowerCase().includes(search.toLowerCase());
    const matchesYear = yearFilter === 'all' || entry.yearOfStudy === yearFilter;
    return matchesSearch && matchesYear;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4" /> Collegiate Standings
          </div>
          <h2 className="text-2xl font-black text-white mt-1 font-sans">
            CYBERFORT 2026 Leaderboard
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Ranked by authoritative score · Tie-breaker: least elapsed duration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/export-csv"
            download
            className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
          </a>
          <button
            onClick={fetchLeaderboard}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
            title="Refresh Leaderboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search verified investigators..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full sm:w-auto text-xs font-mono">
          <button
            onClick={() => setYearFilter('all')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              yearFilter === 'all' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Years
          </button>
          <button
            onClick={() => setYearFilter('First Year')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              yearFilter === 'First Year' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            1st Year
          </button>
          <button
            onClick={() => setYearFilter('Second Year')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              yearFilter === 'Second Year' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            2nd Year
          </button>
        </div>
      </div>

      {/* Leaderboard Data Table */}
      <div className="glass-panel rounded-2xl border border-emerald-500/25 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Investigator</th>
                <th className="py-3.5 px-4">Class Year</th>
                <th className="py-3.5 px-4 text-right">Duration</th>
                <th className="py-3.5 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-cyan-400 font-mono text-xs">
                    SYNCHRONIZING VERIFIED LEADERBOARD...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-mono text-xs">
                    NO VERIFIED COMPLETIONS MATCH CURRENT FILTERS.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr key={entry.uid} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400/20 text-yellow-400 font-bold">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 font-bold">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600/20 text-amber-500 font-bold">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold tabular-nums">#{rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block font-sans text-sm">{entry.displayName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">UID: {entry.uid.slice(0, 10)}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{entry.yearOfStudy}</td>
                      <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                        {entry.durationSeconds}s
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-400 font-bold tabular-nums text-sm">
                          {entry.score}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">PTS</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
