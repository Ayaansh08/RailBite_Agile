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
  }
}

// Transition graph adapted from VALID_TRANSITIONS in railbite-old
const ALLOWED_TRANSITIONS = Object.freeze({
  [ORDER_STATUS.PENDING]: Object.freeze([ORDER_STATUS.ACCEPTED, ORDER_STATUS.REJECTED]),
  [ORDER_STATUS.ACCEPTED]: Object.freeze([ORDER_STATUS.PREPARING]),
  [ORDER_STATUS.PREPARING]: Object.freeze([ORDER_STATUS.OUT_FOR_DELIVERY]),
  [ORDER_STATUS.OUT_FOR_DELIVERY]: Object.freeze([ORDER_STATUS.DELIVERED]),
  [ORDER_STATUS.DELIVERED]: Object.freeze([]),
  [ORDER_STATUS.REJECTED]: Object.freeze([]),
});

/**
 * Checks whether a transition between two statuses is allowed.
 * @param {string} from
 * @param {string} to
 * @returns {boolean}
 */
const canTransition = (from, to) => {
  if (!from || !to) return false;
  const targets = ALLOWED_TRANSITIONS[from];
  if (!targets) return false;
  return targets.includes(to);
};

/**
 * Enforces transition on an order, returning a brand new order object.
 * @param {object} order
 * @param {string} to
 * @param {Date|string} [now=new Date()]
 * @returns {object} new order object
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
};
