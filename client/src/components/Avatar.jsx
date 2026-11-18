import React from 'react';

const AVATAR_GRADIENTS = [
  ['#7c3aed', '#3b82f6'],
  ['#6366f1', '#22d3ee'],
  ['#a855f7', '#ec4899'],
  ['#2563eb', '#8b5cf6'],
  ['#0ea5e9', '#7c3aed']
];

export function Avatar({ name = '?', size = 44, ring = false }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const pair = AVATAR_GRADIENTS[name.length % AVATAR_GRADIENTS.length];

  return (
    <span
      className={`avatar ${ring ? 'avatar-ring' : ''}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export default Avatar;
