import React from 'react';
import { Icon } from './Icons';

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'violet'
}) {
  return (
    <div className="stat-card">
      <span className={`stat-icon tone-bg-${tone}`}>
        <Icon name={icon} size={20} />
      </span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {hint && <p className="stat-hint">{hint}</p>}
      </div>
    </div>
  );
}

export default StatCard;
