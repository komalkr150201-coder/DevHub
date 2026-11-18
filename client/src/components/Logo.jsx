import React from 'react';
import { Icon } from './Icons';

export function Logo({ onClick }) {
  return (
    <span className="logo" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <span className="logo-mark">
        <Icon name="code" size={18} />
      </span>
      <span>
        Dev<b>Hub</b>
      </span>
    </span>
  );
}

export default Logo;
