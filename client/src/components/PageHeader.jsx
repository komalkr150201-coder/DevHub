import React from 'react';

export function PageHeader({ title, text, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {text && <p className="muted">{text}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
