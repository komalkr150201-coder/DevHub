import React from 'react';

export function SkillChip({ children, active, onClick, tone }) {
  const className = `skill-chip ${active ? 'active' : ''} ${tone ? `tone-${tone}` : ''}`.trim();
  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-pressed={!!active}
      >
        {children}
      </button>
    );
  }
  return <span className={className}>{children}</span>;
}

export default SkillChip;
