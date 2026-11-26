/**
 * frontend/src/features/vendor-dashboard/StatusBadge.jsx
 * Visual status pill component with consistent theme coloring.
 */

import React from 'react';

const STATUS_STYLES = {
  Pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  Accepted: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  Preparing: { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
  OutForDelivery: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
  Delivered: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  Rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
};

export default function StatusBadge({ status }) {
  const styleConfig = STATUS_STYLES[status] || {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
  };

  return (
    <span
      data-testid="status-badge"
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        backgroundColor: styleConfig.bg,
        color: styleConfig.text,
        border: `1px solid ${styleConfig.border}`,
      }}
    >
      {status}
    </span>
  );
}
