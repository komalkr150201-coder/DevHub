import React from 'react';
import { Icon } from './Icons';

export function Badge({ tone = 'default', children, icon }) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

export default Badge;
