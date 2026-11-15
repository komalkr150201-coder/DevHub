import React from 'react';

// GitHub recognized language colors
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Shell: '#89e051',
  SQL: '#e38c00',
};

export const LanguageChart = ({ repos = [] }) => {
  // Aggregate total bytes across all visible repos
  const totals = {};
  let overallBytes = 0;

  for (const repo of repos) {
    if (repo.isHidden) continue;
    for (const lang of repo.languages || []) {
      if (!lang.name || !lang.bytes) continue;
      totals[lang.name] = (totals[lang.name] || 0) + lang.bytes;
      overallBytes += lang.bytes;
    }
  }

  if (overallBytes === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 font-mono">
        No language data available yet.
      </div>
    );
  }

  // Convert to sorted percentages
  const languages = Object.entries(totals)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / overallBytes) * 1000) / 10,
      color: LANGUAGE_COLORS[name] || '#6e7681',
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8); // Top 8

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
        <span>Languages Breakdown</span>
        <span className="text-xs font-mono text-gray-400">
          {(overallBytes / 1024 / 1024).toFixed(1)} MB analyzed
        </span>
      </h3>

      {/* Stacked Progress Bar */}
      <div className="h-3.5 w-full bg-[#0d1117] rounded-full overflow-hidden flex mb-5 border border-[#30363d]">
        {languages.map((lang, idx) => (
          <div
            key={idx}
            style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
            className="h-full transition-all duration-300 hover:opacity-80"
            title={`${lang.name}: ${lang.percentage}%`}
          />
        ))}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {languages.map((lang, idx) => (
          <div key={idx} className="flex items-center space-x-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: lang.color }}
            />
            <span className="font-medium text-gray-200 truncate">{lang.name}</span>
            <span className="text-gray-400 font-mono text-[11px] ml-auto">
              {lang.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
