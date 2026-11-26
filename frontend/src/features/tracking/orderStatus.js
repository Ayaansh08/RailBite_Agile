export const ORDER_STATUS = Object.freeze({
  Pending: 'Pending',
  Accepted: 'Accepted',
  Preparing: 'Preparing',
  OutForDelivery: 'OutForDelivery',
  Delivered: 'Delivered',
  Rejected: 'Rejected',
});

export const ORDER_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS.Pending]: 'Waiting for restaurant',
  [ORDER_STATUS.Accepted]: 'Order accepted',
  [ORDER_STATUS.Preparing]: 'Being prepared',
  [ORDER_STATUS.OutForDelivery]: 'Out for delivery',
  [ORDER_STATUS.Delivered]: 'Delivered',
  [ORDER_STATUS.Rejected]: 'Rejected by restaurant',
});

const FALLBACK_LABEL = 'Status unavailable';

export function getStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] ?? FALLBACK_LABEL;
}

export const TERMINAL_STATUSES = Object.freeze([
  ORDER_STATUS.Delivered,
  ORDER_STATUS.Rejected,
]);

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(status);
}
