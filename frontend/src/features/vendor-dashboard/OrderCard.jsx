/**
 * frontend/src/features/vendor-dashboard/OrderCard.jsx
 * Order fulfillment card displaying arrival schedule, PNR summary, items, and status.
 */

import React from 'react';
import StatusBadge from './StatusBadge';

export default function OrderCard({ order, onStatusChange }) {
  if (!order) return null;

  const {
    id,
    pnrLast4,
    arrivalTime,
    arrivalDayOffset = 0,
    items = [],
    totalAmount,
    status,
    rejectReason,
  } = order;

  const hasDayOffset = typeof arrivalDayOffset === 'number' && arrivalDayOffset > 0;
  const dayOffsetLabel = hasDayOffset
    ? `+${arrivalDayOffset} day${arrivalDayOffset > 1 ? 's' : ''}`
    : null;

  return (
    <div
      data-testid={`order-card-${id}`}
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Top row: Order ID, PNR mask, Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '14px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
            }}
          >
            {id}
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: '#64748b',
              marginTop: '4px',
              margin: '4px 0 0 0',
              fontFamily: 'monospace',
            }}
          >
            PNR: •••• {pnrLast4 || '----'}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Prominent Arrival Time Banner */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '10px 12px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🚆</span>
          <div>
            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
              TRAIN ARRIVAL
            </span>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#166534',
                margin: '2px 0 0 0',
              }}
            >
              {arrivalTime || 'Scheduled'}
            </p>
          </div>
        </div>

        {hasDayOffset && (
          <span
            style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid #86efac',
            }}
          >
            {dayOffsetLabel}
          </span>
        )}
      </div>

      {/* Items list */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '14px',
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Items ({items.length})
        </span>
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item, idx) => (
            <div
              key={item.itemId || idx}
              style={{
                fontSize: '13px',
                color: '#1e293b',
              }}
            >
              <span>
                {item.quantity || item.qty}x {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total amount */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '12px',
          fontSize: '14px',
          color: '#0f172a',
        }}
      >
        <span style={{ fontWeight: 600 }}>Total Amount</span>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f6e56' }}>
          ₹{totalAmount}
        </span>
      </div>

      {/* Reject reason (if rejected) */}
      {status === 'Rejected' && rejectReason && (
        <p
          style={{
            marginTop: '10px',
            fontSize: '12px',
            color: '#b91c1c',
            background: '#fef2f2',
            padding: '8px',
            borderRadius: '6px',
          }}
        >
          <strong>Reason:</strong> {rejectReason}
        </p>
      )}
    </div>
  );
}
