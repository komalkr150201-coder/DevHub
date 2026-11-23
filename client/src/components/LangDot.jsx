import React from 'react';

export const LANG_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3b82f6',
  Python: '#38bdf8',
  HTML: '#f97316',
  CSS: '#a855f7',
  Java: '#ef4444',
  Go: '#22d3ee',
  Rust: '#fb923c',
  Shell: '#4ade80'
};

export function LangDot({ language }) {
  const bg = LANG_COLORS[language] || '#94a3b8';
  return (
    <span className="lang">
      <i style={{ background: bg }} />
      {language}
    </span>
  );
}

export default LangDot;
