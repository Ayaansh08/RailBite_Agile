import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchOrder } from './trackingService';
import { isTerminalStatus } from './orderStatus';

export const DEFAULT_POLL_INTERVAL_MS = 10000;

export function useOrderTracking(orderId, pollIntervalMs = DEFAULT_POLL_INTERVAL_MS) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // Guards to prevent overlapping requests and polling after terminal state
  const pendingRef = useRef(false);
  const stoppedRef = useRef(false);
  const intervalRef = useRef(null);

  const poll = useCallback(async () => {
    if (pendingRef.current || stoppedRef.current) return;
    pendingRef.current = true;
    try {
      const data = await fetchOrder(orderId);
      setOrder(data);
      setError(null);
      if (isTerminalStatus(data?.status)) {
        stoppedRef.current = true;
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      setError(err);
    } finally {
      pendingRef.current = false;
    }
  }, [orderId]);

  useEffect(() => {
    // Reset guards when orderId changes
    pendingRef.current = false;
    stoppedRef.current = false;

    poll();
    intervalRef.current = setInterval(poll, pollIntervalMs);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [orderId, pollIntervalMs, poll]);

  return { order, error };
}
