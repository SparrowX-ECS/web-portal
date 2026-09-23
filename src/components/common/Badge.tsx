import React from 'react';

type BadgeColor = 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  status?: string;
  channel?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color, status, channel }) => {
  let resolvedColor: BadgeColor = color || 'slate';

  if (status) {
    const s = status.toUpperCase();
    if (s === 'DONE' || s === 'PAID' || s === 'SENT') {
      resolvedColor = 'green';
    } else if (s === 'IN_PROGRESS' || s === 'SMS') {
      resolvedColor = 'blue';
    } else if (s === 'TODO' || s === 'PENDING') {
      resolvedColor = 'amber';
    } else if (s === 'CANCELLED' || s === 'FAILED') {
      resolvedColor = 'red';
    }
  } else if (channel) {
    const c = channel.toLowerCase();
    if (c === 'email') resolvedColor = 'purple';
    else if (c === 'sms') resolvedColor = 'blue';
    else if (c === 'push') resolvedColor = 'green';
  }

  return <span className={`badge badge-${resolvedColor}`}>{children}</span>;
};
