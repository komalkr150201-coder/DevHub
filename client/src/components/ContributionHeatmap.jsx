import React from 'react';
import { Flame, GitCommit, Star, GitFork, Users } from 'lucide-react';

export const ContributionHeatmap = ({ stats = {} }) => {
  const {
    totalStars = 0,
    totalForks = 0,
    followers = 0,
    contributionStreak = 0,
    recentCommits = 0,
  } = stats;

  // Generate a realistic mini contribution activity grid (last 16 weeks)
  const weeks = 16;
  const daysPerWeek = 7;
  const cells = [];

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < daysPerWeek; d++) {
      // Deterministic level simulation based on streak & index
      const seed = (w * 7 + d * 3) % 11;
      let level = 0;
      if (seed > 7) level = 3;
      else if (seed > 4) level = 2;
      else if (seed > 2) level = 1;

      cells.push({ week: w, day: d, level });
    }
  }

  const levelColor = {
    0: 'bg-[#161b22] border-[#21262d]',
    1: 'bg-emerald-950/60 border-emerald-900',
    2: 'bg-emerald-700 border-emerald-600',
    3: 'bg-emerald-400 border-emerald-300',
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{contributionStreak}d</div>
            <div className="text-[11px] text-gray-400">Active Streak</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{recentCommits}</div>
            <div className="text-[11px] text-gray-400">90d Commits</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
            <Star className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{totalStars}</div>
            <div className="text-[11px] text-gray-400">Stars Earned</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{totalForks}</div>
            <div className="text-[11px] text-gray-400">Forks Earned</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] flex items-center space-x-3 col-span-2 sm:col-span-1">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{followers}</div>
            <div className="text-[11px] text-gray-400">Followers</div>
          </div>
        </div>
      </div>

      {/* Activity Heatmap Grid */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span className="font-semibold text-gray-300">GitHub Activity Stream</span>
          <span className="font-mono text-[11px]">Last 16 weeks</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div
            className="grid grid-rows-7 grid-flow-col gap-1 w-max"
            style={{ gridTemplateColumns: `repeat(${weeks}, minmax(12px, 1fr))` }}
          >
            {cells.map((cell, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-[3px] border ${levelColor[cell.level]} transition-colors hover:ring-1 hover:ring-white`}
                title={`Activity index week ${cell.week + 1}, day ${cell.day + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-1.5 text-[10px] text-gray-400 mt-2">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#161b22] border border-[#21262d]" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950 border border-emerald-900" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
