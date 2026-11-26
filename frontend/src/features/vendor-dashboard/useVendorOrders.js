/**
 * frontend/src/features/vendor-dashboard/useVendorOrders.js
 * Custom hook managing vendor order state, tab filtering, polling, and inflight guards.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchVendorOrders } from './ordersService';

export function useVendorOrders(vendorId, pollIntervalMs = 10000) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const inFlightRef = useRef(false);
  const isMountedRef = useRef(true);

  const loadOrders = useCallback(
    async (showLoading = false) => {
      if (!vendorId || inFlightRef.current) return;

      inFlightRef.current = true;
      if (showLoading) {
        setLoading(true);
      }

      try {
        const data = await fetchVendorOrders(vendorId);
        if (isMountedRef.current) {
          setOrders(data);
          setError(null);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || 'Failed to load orders');
        }
      } finally {
        inFlightRef.current = false;
        if (isMountedRef.current && showLoading) {
          setLoading(false);
        }
      }
    },
    [vendorId]
  );

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    loadOrders(true);

    return () => {
      isMountedRef.current = false;
    };
  }, [loadOrders]);

  // Periodic polling with cleanup and in-flight guard
  useEffect(() => {
    if (!vendorId || !pollIntervalMs || pollIntervalMs <= 0) return;

    const timerId = setInterval(() => {
      loadOrders(false);
    }, pollIntervalMs);

    return () => {
      clearInterval(timerId);
    };
  }, [vendorId, pollIntervalMs, loadOrders]);

  const displayedOrders =
    filterStatus === 'All'
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  return {
    orders: displayedOrders,
    rawOrders: orders,
    loading,
    error,
    filterStatus,
    setFilterStatus,
    refreshOrders: () => loadOrders(false),
    retry: () => loadOrders(true),
  };
}
