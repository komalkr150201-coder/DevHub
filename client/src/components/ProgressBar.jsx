import React from 'react';

export function ProgressBar({ value = 0, tone = 'brand' }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className="bar"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className={`bar-fill bar-${tone}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default ProgressBar;
