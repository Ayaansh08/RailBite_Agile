/**
 * frontend/src/features/vendor-dashboard/ordersService.js
 * API client methods for vendor order fetching and state updates.
 */

import axios from 'axios';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';

/**
 * Fetches vendor orders, optionally filtering by status.
 *
 * @param {string} vendorId
 * @param {string} [status]
 * @returns {Promise<Array<object>>}
 */
export const fetchVendorOrders = async (vendorId, status) => {
  const params = { vendorId };
  if (status && status !== 'All') {
    params.status = status;
  }
  const response = await axios.get(`${BASE_URL}/api/orders`, { params });
  return response.data?.orders || [];
};

/**
 * Updates an order status with an optional reject reason.
 *
 * @param {string} orderId
 * @param {string} newStatus
 * @param {string} [rejectReason]
 * @returns {Promise<object>}
 */
export const updateOrderStatus = async (orderId, newStatus, rejectReason) => {
  const payload = { status: newStatus };
  if (rejectReason) {
    payload.rejectReason = rejectReason;
  }
  const response = await axios.patch(`${BASE_URL}/api/orders/${orderId}/status`, payload);
  return response.data?.order || response.data;
};
