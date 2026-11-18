import React from 'react';

export function FormField({ label, id, hint, children }) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      {children}
      {hint && <p className="muted small">{hint}</p>}
    </div>
  );
}

export default FormField;
