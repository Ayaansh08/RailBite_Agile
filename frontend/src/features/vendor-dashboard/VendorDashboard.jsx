/**
 * frontend/src/features/vendor-dashboard/VendorDashboard.jsx
 * Primary vendor workspace for real-time order fulfillment and schedule tracking.
 * Ported and adapted from railbite-old src/pages/VendorDashboard.jsx.
 */

import React from 'react';
import { useVendorOrders } from './useVendorOrders';
import { STATUS_TABS } from './orderStatus';
import OrderCard from './OrderCard';

export default function VendorDashboard({
  vendorId,
  pollIntervalMs = 10000,
  vendorName = 'Vendor Portal',
  stationName = '',
}) {
  const {
    orders,
    loading,
    error,
    filterStatus,
    setFilterStatus,
    refreshOrders,
    retry,
  } = useVendorOrders(vendorId, pollIntervalMs);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#0f172a',
      }}
    >
      {/* Top Navigation / Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '18px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            {vendorName}
          </h1>
          {stationName && (
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Station: {stationName}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={refreshOrders}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Error Banner */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button
              onClick={retry}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '20px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = filterStatus === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isActive ? '#0f6e56' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive
                    ? '0 1px 2px rgba(0,0,0,0.1)'
                    : 'inset 0 0 0 1px #e2e8f0',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* State Display: Loading vs Empty vs Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <p style={{ fontSize: '15px' }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            <p style={{ fontSize: '15px', fontWeight: 500, margin: 0 }}>
              No orders yet.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
