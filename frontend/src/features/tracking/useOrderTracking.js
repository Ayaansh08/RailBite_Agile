import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchOrder } from './trackingService';
import { isTerminalStatus } from './orderStatus';

export const DEFAULT_POLL_INTERVAL_MS = 10000;

export function useOrderTracking(orderId, pollIntervalMs = DEFAULT_POLL_INTERVAL_MS) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const intervalRef = useRef(null);
  const stoppedRef = useRef(false);

  const poll = useCallback(async () => {
    if (isFetchingRef.current || stoppedRef.current) return;
    isFetchingRef.current = true;
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
      isFetchingRef.current = false;
    }
  }, [orderId]);

  useEffect(() => {
    stoppedRef.current = false;
    poll();
    intervalRef.current = setInterval(poll, pollIntervalMs);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [orderId, pollIntervalMs, poll]);

  return { order, error };
}
