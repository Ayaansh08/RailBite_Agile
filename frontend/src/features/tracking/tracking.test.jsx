import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import axios from 'axios';

import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  getStatusLabel,
} from './orderStatus';
import { fetchOrder } from './trackingService';
import { DEFAULT_POLL_INTERVAL_MS } from './useOrderTracking';
import OrderTracker from './OrderTracker';

vi.mock('axios');

function makeOrder(status, overrides = {}) {
  return {
    id: 'ord-101',
    status,
    vendorName: 'Shatabdi Meals',
    expectedArrivalTime: '12:15',
    ...overrides,
  };
}

describe('orderStatus (RB-107)', () => {
  it('defines all 6 canonical statuses and labels', () => {
    expect(ORDER_STATUS_LABELS[ORDER_STATUS.Pending]).toBe('Waiting for restaurant');
    expect(ORDER_STATUS_LABELS[ORDER_STATUS.Accepted]).toBe('Order accepted');
    expect(ORDER_STATUS_LABELS[ORDER_STATUS.Preparing]).toBe('Being prepared');
    expect(ORDER_STATUS_LABELS[ORDER_STATUS.OutForDelivery]).toBe('Out for delivery');
    expect(ORDER_STATUS_LABELS[ORDER_STATUS.Delivered]).toBe('Delivered');
    expect(ORDER_STATUS_LABELS[ORDER_STATUS.Rejected]).toBe('Rejected by restaurant');
  });

  it('falls back to a safe label for unknown status', () => {
    expect(getStatusLabel('WeirdStatus')).toBe('Status unavailable');
    expect(getStatusLabel(undefined)).toBe('Status unavailable');
  });
});

describe('trackingService (RB-107)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches order via GET /api/orders/:id', async () => {
    const order = makeOrder(ORDER_STATUS.Pending);
    axios.get.mockResolvedValueOnce({ data: order });

    const result = await fetchOrder('ord-101');
    expect(axios.get).toHaveBeenCalledWith('/api/orders/ord-101');
    expect(result).toEqual(order);
  });
});

describe('OrderTracker & useOrderTracking (RB-107)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [ORDER_STATUS.Pending, 'Waiting for restaurant'],
    [ORDER_STATUS.Accepted, 'Order accepted'],
    [ORDER_STATUS.Preparing, 'Being prepared'],
    [ORDER_STATUS.OutForDelivery, 'Out for delivery'],
    [ORDER_STATUS.Delivered, 'Delivered'],
    [ORDER_STATUS.Rejected, 'Rejected by restaurant'],
  ])('renders status %s correctly with vendor name and expected arrival time', async (status, expectedLabel) => {
    axios.get.mockResolvedValueOnce({ data: makeOrder(status) });

    render(<OrderTracker orderId="ord-101" />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Shatabdi Meals')).toBeInTheDocument();
    expect(screen.getByText(/12:15/)).toBeInTheDocument();
    // The label appears as the highlighted step in the timeline (aria-current="step")
    if (status === ORDER_STATUS.Rejected) {
      expect(screen.getByRole('alert')).toHaveTextContent(expectedLabel);
    } else {
      expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent(expectedLabel);
    }
  });

  it('renders a safe fallback label when status is unknown', async () => {
    axios.get.mockResolvedValueOnce({ data: makeOrder('MysteryState') });

    render(<OrderTracker orderId="ord-101" />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Status unavailable')).toBeInTheDocument();
  });

  it('polls at interval and stops polling when Delivered', async () => {
    axios.get
      .mockResolvedValueOnce({ data: makeOrder(ORDER_STATUS.Pending) })
      .mockResolvedValueOnce({ data: makeOrder(ORDER_STATUS.Preparing) })
      .mockResolvedValueOnce({ data: makeOrder(ORDER_STATUS.Delivered) });

    render(<OrderTracker orderId="ord-101" pollIntervalMs={DEFAULT_POLL_INTERVAL_MS} />);

    await act(async () => {
      await Promise.resolve();
    });
    expect(axios.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEFAULT_POLL_INTERVAL_MS);
    });
    expect(axios.get).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEFAULT_POLL_INTERVAL_MS);
    });
    expect(axios.get).toHaveBeenCalledTimes(3);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEFAULT_POLL_INTERVAL_MS * 3);
    });
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  it('stops polling when Rejected', async () => {
    axios.get
      .mockResolvedValueOnce({ data: makeOrder(ORDER_STATUS.Pending) })
      .mockResolvedValueOnce({ data: makeOrder(ORDER_STATUS.Rejected) });

    render(<OrderTracker orderId="ord-101" pollIntervalMs={3000} />);

    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(axios.get).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('cleans up polling interval on unmount', async () => {
    axios.get.mockResolvedValue({ data: makeOrder(ORDER_STATUS.Pending) });

    const { unmount } = render(<OrderTracker orderId="ord-101" pollIntervalMs={2000} />);

    await act(async () => {
      await Promise.resolve();
    });
    expect(axios.get).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('does not overlap in-flight requests when previous poll has not settled', async () => {
    let resolveFirst;
    axios.get.mockImplementationOnce(
      () => new Promise((resolve) => { resolveFirst = resolve; })
    );

    render(<OrderTracker orderId="ord-101" pollIntervalMs={1000} />);
    expect(axios.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(axios.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst({ data: makeOrder(ORDER_STATUS.Accepted) });
      await Promise.resolve();
    });
  });

  it('keeps last known status and shows retry hint on request failure', async () => {
    axios.get
      .mockResolvedValueOnce({ data: makeOrder(ORDER_STATUS.Preparing) })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<OrderTracker orderId="ord-101" pollIntervalMs={2000} />);

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Being prepared');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Being prepared');
    expect(screen.getByRole('alert')).toHaveTextContent(/retry/i);
  });
});
