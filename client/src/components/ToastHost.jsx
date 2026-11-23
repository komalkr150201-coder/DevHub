import React from 'react';
import { Icon } from './Icons';

export function ToastHost({ toasts = [], onDismiss }) {
  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className={`toast toast-${item.type}`}>
          <Icon name={item.type === 'error' ? 'x' : 'check'} size={16} />
          <span>{item.message}</span>
          <button
            type="button"
            aria-label="Dismiss"
            className="icon-btn"
            onClick={() => onDismiss && onDismiss(item.id)}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastHost;
