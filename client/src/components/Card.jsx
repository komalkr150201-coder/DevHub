import React from 'react';

export function Card({
  title,
  subtitle,
  action,
  className = '',
  children,
  pad = true
}) {
  return (
    <section className={`card ${pad ? '' : 'card-flush'} ${className}`}>
      {(title || action) && (
        <header className="card-head">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-sub">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export default Card;
