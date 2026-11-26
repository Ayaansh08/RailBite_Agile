/**
 * backend/src/orders/orderStateMachine.js
 * Order status state machine enforcing valid transitions and tracking status history.
 * Ported and adapted from railbite-old backend/controllers/orderController.js VALID_TRANSITIONS.
 */

const { ORDER_STATUS } = require('./orderStatus');

class InvalidTransitionError extends Error {
  constructor(from, to) {
    super(`Cannot transition order from "${from}" to "${to}".`);
    this.name = 'InvalidTransitionError';
    this.statusCode = 400;
    this.code = 'INVALID_TRANSITION';
  }
}

/**
 * Immutable map defining allowed forward transitions for each order status.
 * Terminal states (Delivered, Rejected) have empty transition targets.
 */
const ALLOWED_TRANSITIONS = Object.freeze({
  [ORDER_STATUS.Pending]: Object.freeze([ORDER_STATUS.Accepted, ORDER_STATUS.Rejected]),
  [ORDER_STATUS.Accepted]: Object.freeze([ORDER_STATUS.Preparing]),
  [ORDER_STATUS.Preparing]: Object.freeze([ORDER_STATUS.OutForDelivery]),
  [ORDER_STATUS.OutForDelivery]: Object.freeze([ORDER_STATUS.Delivered]),
  [ORDER_STATUS.Delivered]: Object.freeze([]),
  [ORDER_STATUS.Rejected]: Object.freeze([]),
});

/**
 * Checks whether a transition between two statuses is allowed.
 * @param {string} from - Current status of order
 * @param {string} to - Intended target status
 * @returns {boolean} True if allowed, false otherwise
 */
const canTransition = (from, to) => {
  if (!from || !to) return false;
  const targets = ALLOWED_TRANSITIONS[from];
  return Boolean(targets && targets.includes(to));
};

/**
 * Enforces a state transition on an order, returning an immutable new order object.
 * Does not mutate the input order. Appends a statusHistory record { status, at }.
 *
 * @param {object} order - Current order object
 * @param {string} to - Intended target status
 * @param {Date|string} [now=new Date()] - Transition timestamp for status history
 * @returns {object} New order object with updated status and appended history entry
 * @throws {InvalidTransitionError} If transition is invalid or order is missing
 */
const transitionOrder = (order, to, now = new Date()) => {
  if (!order || typeof order !== 'object') {
    throw new InvalidTransitionError(undefined, to);
  }

  const from = order.status;
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }

  const existingHistory = Array.isArray(order.statusHistory)
    ? order.statusHistory
    : [];

  return {
    ...order,
    status: to,
    statusHistory: [
      ...existingHistory,
      {
        status: to,
        at: now,
      },
    ],
  };
};

module.exports = {
  canTransition,
  transitionOrder,
  InvalidTransitionError,
  ALLOWED_TRANSITIONS,
};
