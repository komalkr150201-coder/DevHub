import React from 'react';

export function ToggleSwitch({
  checked = false,
  onChange,
  label,
  description,
  id
}) {
  return (
    <div className="toggle-row">
      <div>
        <label htmlFor={id} className="toggle-label">
          {label}
        </label>
        {description && <p className="muted small">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={`switch ${checked ? 'on' : ''}`}
        onClick={() => onChange && onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

export default ToggleSwitch;
