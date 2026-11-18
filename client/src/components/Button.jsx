import React from 'react';
import { Icon } from './Icons';

export function Button({
  variant = 'primary',
  size,
  icon,
  iconRight,
  loading,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="spinner" aria-hidden="true" />
      ) : icon ? (
        <Icon name={icon} size={16} />
      ) : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={16} /> : null}
    </button>
  );
}

export default Button;
