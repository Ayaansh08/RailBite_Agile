/**
 * backend/src/orders/orderStatus.js
 * Canonical order status definitions and mapping from legacy prototype statuses.
 */

const ORDER_STATUS = Object.freeze({
  Pending: 'Pending',
  Accepted: 'Accepted',
  Preparing: 'Preparing',
  OutForDelivery: 'OutForDelivery',
  Delivered: 'Delivered',
  Rejected: 'Rejected',
  // Uppercase aliases
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'OutForDelivery',
  DELIVERED: 'Delivered',
  REJECTED: 'Rejected',
});

// Mapping from old prototype strings (railbite-old) to canonical statuses
const LEGACY_STATUS_MAPPING = Object.freeze({
  'Pending Payment': ORDER_STATUS.Pending,
  Paid: ORDER_STATUS.Pending,
  Accepted: ORDER_STATUS.Accepted,
  Preparing: ORDER_STATUS.Preparing,
  'Out for Delivery': ORDER_STATUS.OutForDelivery,
  Delivered: ORDER_STATUS.Delivered,
  Rejected: ORDER_STATUS.Rejected,
});

module.exports = {
  ORDER_STATUS,
  LEGACY_STATUS_MAPPING,
  Pending: ORDER_STATUS.Pending,
  Accepted: ORDER_STATUS.Accepted,
  Preparing: ORDER_STATUS.Preparing,
  OutForDelivery: ORDER_STATUS.OutForDelivery,
  Delivered: ORDER_STATUS.Delivered,
  Rejected: ORDER_STATUS.Rejected,
};
