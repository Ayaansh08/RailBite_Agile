/**
 * frontend/src/features/vendor-dashboard/orderStatus.js
 * Status constants and display metadata for vendor order workflows.
 */

export const ORDER_STATUS = Object.freeze({
  Pending: 'Pending',
  Accepted: 'Accepted',
  Preparing: 'Preparing',
  OutForDelivery: 'OutForDelivery',
  Delivered: 'Delivered',
  Rejected: 'Rejected',
});

export const STATUS_TABS = Object.freeze([
  'All',
  ORDER_STATUS.Pending,
  ORDER_STATUS.Accepted,
  ORDER_STATUS.Preparing,
  ORDER_STATUS.OutForDelivery,
  ORDER_STATUS.Delivered,
  ORDER_STATUS.Rejected,
]);
