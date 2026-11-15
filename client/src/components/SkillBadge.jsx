import React from 'react';
import { CheckCircle2, UserCheck, Flame } from 'lucide-react';

export const SkillBadge = ({ name, weight = 0, source = 'auto', showWeight = true, size = 'md' }) => {
  const percentage = Math.round(weight * 100);

  // Proficiency color
  const getColor = (pct) => {
    if (pct >= 85) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', bar: 'bg-emerald-500' };
    if (pct >= 65) return { bg: 'bg-teal-500/10', border: 'border-teal-500/40', text: 'text-teal-400', bar: 'bg-teal-500' };
    if (pct >= 40) return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', text: 'text-cyan-400', bar: 'bg-cyan-500' };
    return { bg: 'bg-gray-800', border: 'border-gray-700', text: 'text-gray-300', bar: 'bg-gray-600' };
  };

  const scheme = getColor(percentage);

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${scheme.bg} ${scheme.border} ${scheme.text} border`}>
        <span>{name}</span>
        {showWeight && <span className="opacity-75 font-mono text-[10px]">{percentage}%</span>}
      </span>
    );
  }

  return (
    <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-sm text-white">{name}</span>
          {source === 'auto' ? (
            <span title="Verified by real GitHub code analysis">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          ) : (
            <span title="Self-declared skill">
              <UserCheck className="w-3.5 h-3.5 text-gray-400" />
            </span>
          )}
        </div>
        {showWeight && (
          <span className={`text-xs font-mono font-bold ${scheme.text}`}>
            {percentage}%
          </span>
        )}
      </div>

      {showWeight && (
        <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${scheme.bar} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
        <span>{source === 'auto' ? 'GitHub Verified' : 'Self-Declared'}</span>
        {percentage >= 80 && (
          <span className="flex items-center text-amber-400 space-x-0.5">
            <Flame className="w-3 h-3 fill-amber-400" />
            <span>Top Skill</span>
          </span>
        )}
      </div>
    </div>
  );
};
