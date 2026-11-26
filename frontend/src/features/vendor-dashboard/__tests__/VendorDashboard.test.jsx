import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VendorDashboard from '../VendorDashboard';
import OrderCard from '../OrderCard';
import { fetchVendorOrders } from '../ordersService';

vi.mock('../ordersService', () => ({
  fetchVendorOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

describe('RB-403: VendorDashboard with arrival time and order fulfillment', () => {
  const sampleOrders = [
    {
      id: 'ORD-101',
      pnrLast4: '3210',
      vendorId: 'vendor-1',
      vendorName: 'Bikaner Sweets',
      station: { code: 'CNB', name: 'Kanpur Central' },
      arrivalTime: '10:30',
      arrivalDayOffset: 0,
      items: [{ itemId: 'i-1', name: 'Samosa', price: 30, quantity: 2 }],
      totalAmount: 60,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', at: '2026-11-26T08:00:00Z' }],
      createdAt: '2026-11-26T08:00:00Z',
    },
    {
      id: 'ORD-102',
      pnrLast4: '9999',
      vendorId: 'vendor-1',
      vendorName: 'Bikaner Sweets',
      station: { code: 'CNB', name: 'Kanpur Central' },
      arrivalTime: '02:15',
      arrivalDayOffset: 1,
      items: [{ itemId: 'i-2', name: 'Kachori', price: 25, quantity: 4 }],
      totalAmount: 100,
      status: 'Accepted',
      statusHistory: [{ status: 'Accepted', at: '2026-11-26T09:00:00Z' }],
      createdAt: '2026-11-26T08:30:00Z',
    },
    {
      id: 'ORD-103',
      pnrLast4: '1111',
      vendorId: 'vendor-1',
      vendorName: 'Bikaner Sweets',
      station: { code: 'CNB', name: 'Kanpur Central' },
      arrivalTime: '18:45',
      arrivalDayOffset: 2,
      items: [{ itemId: 'i-3', name: 'Gulab Jamun', price: 40, quantity: 1 }],
      totalAmount: 40,
      status: 'Delivered',
      statusHistory: [{ status: 'Delivered', at: '2026-11-26T19:00:00Z' }],
      createdAt: '2026-11-26T17:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OrderCard component', () => {
    test('renders order details, pnrLast4, items, total, and arrival time', () => {
      render(<OrderCard order={sampleOrders[0]} />);

      expect(screen.getByText('ORD-101')).toBeInTheDocument();
      expect(screen.getByText(/3210/)).toBeInTheDocument();
      expect(screen.getByText(/10:30/)).toBeInTheDocument();
      expect(screen.getByText(/2x Samosa/i)).toBeInTheDocument();
      expect(screen.getByText(/₹60/)).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    test('shows +N day offset badge when arrivalDayOffset > 0', () => {
      const { rerender } = render(<OrderCard order={sampleOrders[1]} />);
      expect(screen.getByText(/\+1 day/i)).toBeInTheDocument();

      rerender(<OrderCard order={sampleOrders[2]} />);
      expect(screen.getByText(/\+2 days/i)).toBeInTheDocument();
    });

    test('does not show offset badge when arrivalDayOffset is 0 or undefined', () => {
      render(<OrderCard order={sampleOrders[0]} />);
      expect(screen.queryByText(/\+.*day/i)).not.toBeInTheDocument();
    });
  });

  describe('VendorDashboard states and interactions', () => {
    test('shows loading indicator while fetching orders', async () => {
      fetchVendorOrders.mockReturnValue(new Promise(() => {})); // pending promise
      render(<VendorDashboard vendorId="vendor-1" />);

      expect(screen.getByText(/Loading orders\.\.\./i)).toBeInTheDocument();
    });

    test('shows empty state when vendor has no orders', async () => {
      fetchVendorOrders.mockResolvedValueOnce([]);
      render(<VendorDashboard vendorId="vendor-1" />);

      await waitFor(() => {
        expect(screen.getByText('No orders yet.')).toBeInTheDocument();
      });
    });

    test('shows error banner and retries when retry button clicked', async () => {
      fetchVendorOrders
        .mockRejectedValueOnce(new Error('Network failure'))
        .mockResolvedValueOnce(sampleOrders);

      render(<VendorDashboard vendorId="vendor-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Network failure/i)).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('ORD-101')).toBeInTheDocument();
      });
    });

    test('renders tabs and filters orders by status', async () => {
      fetchVendorOrders.mockResolvedValue(sampleOrders);
      render(<VendorDashboard vendorId="vendor-1" />);

      await waitFor(() => {
        expect(screen.getByText('ORD-101')).toBeInTheDocument();
        expect(screen.getByText('ORD-102')).toBeInTheDocument();
        expect(screen.getByText('ORD-103')).toBeInTheDocument();
      });

      // Filter by Accepted
      const acceptedTab = screen.getByRole('button', { name: /^Accepted/i });
      fireEvent.click(acceptedTab);

      expect(screen.queryByText('ORD-101')).not.toBeInTheDocument();
      expect(screen.getByText('ORD-102')).toBeInTheDocument();
      expect(screen.queryByText('ORD-103')).not.toBeInTheDocument();

      // Filter by All
      const allTab = screen.getByRole('button', { name: /^All/i });
      fireEvent.click(allTab);

      expect(screen.getByText('ORD-101')).toBeInTheDocument();
      expect(screen.getByText('ORD-102')).toBeInTheDocument();
      expect(screen.getByText('ORD-103')).toBeInTheDocument();
    });

    test('manual refresh button triggers re-fetch', async () => {
      fetchVendorOrders.mockResolvedValue(sampleOrders);
      render(<VendorDashboard vendorId="vendor-1" />);

      await waitFor(() => {
        expect(screen.getByText('ORD-101')).toBeInTheDocument();
      });

      const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
      await act(async () => {
        fireEvent.click(refreshBtn);
      });

      expect(fetchVendorOrders).toHaveBeenCalledTimes(2);
    });
  });

  describe('Polling and cleanup', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('polls orders at interval and cleans up interval on unmount', async () => {
      fetchVendorOrders.mockResolvedValue(sampleOrders);

      const { unmount } = render(
        <VendorDashboard vendorId="vendor-1" pollIntervalMs={5000} />
      );

      // Initial fetch
      expect(fetchVendorOrders).toHaveBeenCalledTimes(1);

      // Wait for initial fetch to resolve
      await act(async () => {
        await Promise.resolve();
      });

      // Advance by 5000ms
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(fetchVendorOrders).toHaveBeenCalledTimes(2);

      // Advance again
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(fetchVendorOrders).toHaveBeenCalledTimes(3);

      // Unmount component
      unmount();

      // Advancing timer after unmount should not trigger any more fetches
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });
      expect(fetchVendorOrders).toHaveBeenCalledTimes(3);
    });

    test('guards against overlapping requests when previous poll is in-flight', async () => {
      let resolvePromise;
      fetchVendorOrders.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      );

      render(<VendorDashboard vendorId="vendor-1" pollIntervalMs={5000} />);
      expect(fetchVendorOrders).toHaveBeenCalledTimes(1);

      // Timer ticks while first request is still pending
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      // Should not fire another request while in flight
      expect(fetchVendorOrders).toHaveBeenCalledTimes(1);

      // Now resolve first request
      await act(async () => {
        resolvePromise(sampleOrders);
      });

      // Next tick after completion should fire
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(fetchVendorOrders).toHaveBeenCalledTimes(2);
    });
  });
});
