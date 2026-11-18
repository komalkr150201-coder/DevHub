import React from 'react';
import { LANG_COLORS } from './LangDot';

export function LangBar({ langs = {} }) {
  const entries = Object.entries(langs);
  if (!entries.length) return null;

  return (
    <div>
      <div className="langbar">
        {entries.map(([name, pct]) => (
          <span
            key={name}
            style={{ width: `${pct}%`, background: LANG_COLORS[name] || '#94a3b8' }}
            title={`${name} ${pct}%`}
          />
        ))}
      </div>
      <div className="langlist">
        {entries.map(([name, pct]) => (
          <span key={name} className="lang">
            <i style={{ background: LANG_COLORS[name] || '#94a3b8' }} />
            {name} <b>{pct}%</b>
          </span>
        ))}
      </div>
    </div>
  );
}

export default LangBar;
