import React from 'react';
import { Icon } from './Icons';

export function EmptyState({
  icon = 'search',
  title,
  text,
  action
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={26} />
      </span>
      {title && <h4>{title}</h4>}
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
