const {
  ORDER_STATUS,
  CANONICAL_STATUSES,
  isKnownStatus,
} = require('../../src/orders/orderStatus');
const {
  canTransition,
  transitionOrder,
  InvalidTransitionError,
  ALLOWED_TRANSITIONS,
} = require('../../src/orders/orderStateMachine');

describe('Order Status State Machine (RB-401)', () => {
  const {
    Pending,
    Accepted,
    Preparing,
    OutForDelivery,
    Delivered,
    Rejected,
  } = ORDER_STATUS;

  describe('orderStatus constants and helpers', () => {
    test('defines all canonical statuses as named constants', () => {
      expect(Pending).toBe('Pending');
      expect(Accepted).toBe('Accepted');
      expect(Preparing).toBe('Preparing');
      expect(OutForDelivery).toBe('OutForDelivery');
      expect(Delivered).toBe('Delivered');
      expect(Rejected).toBe('Rejected');
    });

    test('isKnownStatus recognizes canonical statuses and rejects unknown ones', () => {
      for (const status of CANONICAL_STATUSES) {
        expect(isKnownStatus(status)).toBe(true);
      }
      expect(isKnownStatus('Unknown')).toBe(false);
      expect(isKnownStatus('')).toBe(false);
      expect(isKnownStatus(null)).toBe(false);
      expect(isKnownStatus(undefined)).toBe(false);
    });

    test('ALLOWED_TRANSITIONS map is deeply frozen', () => {
      expect(Object.isFrozen(ALLOWED_TRANSITIONS)).toBe(true);
      expect(Object.isFrozen(ALLOWED_TRANSITIONS[Pending])).toBe(true);
    });
  });

  describe('canTransition', () => {
    test('returns true for every allowed transition', () => {
      expect(canTransition(Pending, Accepted)).toBe(true);
      expect(canTransition(Pending, Rejected)).toBe(true);
      expect(canTransition(Accepted, Preparing)).toBe(true);
      expect(canTransition(Preparing, OutForDelivery)).toBe(true);
      expect(canTransition(OutForDelivery, Delivered)).toBe(true);
    });

    test('returns false for illegal pairs', () => {
      expect(canTransition(Pending, Delivered)).toBe(false);
      expect(canTransition(Delivered, Pending)).toBe(false);
      expect(canTransition(Accepted, Delivered)).toBe(false);
      expect(canTransition(Rejected, Accepted)).toBe(false);
      expect(canTransition(Pending, Preparing)).toBe(false);
      expect(canTransition(Pending, OutForDelivery)).toBe(false);
      expect(canTransition(Accepted, OutForDelivery)).toBe(false);
      expect(canTransition(Accepted, Rejected)).toBe(false);
      expect(canTransition(Preparing, Accepted)).toBe(false);
      expect(canTransition(Preparing, Delivered)).toBe(false);
      expect(canTransition(Preparing, Rejected)).toBe(false);
      expect(canTransition(OutForDelivery, Preparing)).toBe(false);
      expect(canTransition(OutForDelivery, Accepted)).toBe(false);
      expect(canTransition(OutForDelivery, Rejected)).toBe(false);
    });

    test('returns false for terminal states transitioning to anything', () => {
      const allStatuses = [Pending, Accepted, Preparing, OutForDelivery, Delivered, Rejected];
      for (const target of allStatuses) {
        expect(canTransition(Delivered, target)).toBe(false);
        expect(canTransition(Rejected, target)).toBe(false);
      }
    });

    test('returns false for same-status transitions', () => {
      expect(canTransition(Pending, Pending)).toBe(false);
      expect(canTransition(Accepted, Accepted)).toBe(false);
      expect(canTransition(Preparing, Preparing)).toBe(false);
      expect(canTransition(OutForDelivery, OutForDelivery)).toBe(false);
      expect(canTransition(Delivered, Delivered)).toBe(false);
      expect(canTransition(Rejected, Rejected)).toBe(false);
    });

    test('returns false for unknown, null, or undefined status values', () => {
      expect(canTransition(undefined, Accepted)).toBe(false);
      expect(canTransition(Pending, undefined)).toBe(false);
      expect(canTransition(null, Accepted)).toBe(false);
      expect(canTransition('UNKNOWN', Accepted)).toBe(false);
      expect(canTransition(Pending, 'UNKNOWN')).toBe(false);
    });
  });

  describe('transitionOrder', () => {
    test('succeeds for every allowed transition and returns updated order', () => {
      const fixedTime = new Date('2026-11-22T12:00:00.000Z');

      const initialOrder = { id: 'ORD-1001', status: Pending };
      const acceptedOrder = transitionOrder(initialOrder, Accepted, fixedTime);
      expect(acceptedOrder.status).toBe(Accepted);

      const rejectedOrder = transitionOrder(initialOrder, Rejected, fixedTime);
      expect(rejectedOrder.status).toBe(Rejected);

      const preparingOrder = transitionOrder(acceptedOrder, Preparing, fixedTime);
      expect(preparingOrder.status).toBe(Preparing);

      const outOrder = transitionOrder(preparingOrder, OutForDelivery, fixedTime);
      expect(outOrder.status).toBe(OutForDelivery);

      const deliveredOrder = transitionOrder(outOrder, Delivered, fixedTime);
      expect(deliveredOrder.status).toBe(Delivered);
    });

    test('throws InvalidTransitionError on illegal transitions', () => {
      const orderPending = { id: 'ORD-1001', status: Pending };
      expect(() => transitionOrder(orderPending, Delivered)).toThrow(InvalidTransitionError);

      const orderDelivered = { id: 'ORD-1002', status: Delivered };
      expect(() => transitionOrder(orderDelivered, Pending)).toThrow(InvalidTransitionError);

      const orderAccepted = { id: 'ORD-1003', status: Accepted };
      expect(() => transitionOrder(orderAccepted, Delivered)).toThrow(InvalidTransitionError);

      const orderRejected = { id: 'ORD-1004', status: Rejected };
      expect(() => transitionOrder(orderRejected, Accepted)).toThrow(InvalidTransitionError);
    });

    test('throws InvalidTransitionError on same-status transition', () => {
      const order = { id: 'ORD-1001', status: Pending };
      expect(() => transitionOrder(order, Pending)).toThrow(InvalidTransitionError);
    });

    test('throws InvalidTransitionError on unknown or undefined status values', () => {
      const orderWithInvalidCurrent = { id: 'ORD-1001', status: 'NonExistent' };
      expect(() => transitionOrder(orderWithInvalidCurrent, Accepted)).toThrow(InvalidTransitionError);

      const orderValid = { id: 'ORD-1002', status: Pending };
      expect(() => transitionOrder(orderValid, 'NonExistent')).toThrow(InvalidTransitionError);
      expect(() => transitionOrder(orderValid, undefined)).toThrow(InvalidTransitionError);
      expect(() => transitionOrder(orderValid, null)).toThrow(InvalidTransitionError);
      expect(() => transitionOrder(undefined, Accepted)).toThrow(InvalidTransitionError);
    });

    test('InvalidTransitionError has statusCode 400 and clear message naming both statuses', () => {
      const order = { id: 'ORD-1001', status: Pending };
      try {
        transitionOrder(order, Delivered);
        throw new Error('Should have thrown InvalidTransitionError');
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidTransitionError);
        expect(err.statusCode).toBe(400);
        expect(err.message).toMatch(new RegExp(Pending));
        expect(err.message).toMatch(new RegExp(Delivered));
      }
    });

    test('does not mutate the original order object', () => {
      const fixedTime = new Date('2026-11-22T12:00:00.000Z');
      const originalOrder = Object.freeze({
        id: 'ORD-1001',
        status: Pending,
        statusHistory: Object.freeze([{ status: Pending, at: new Date('2026-11-22T11:00:00.000Z') }]),
      });

      const nextOrder = transitionOrder(originalOrder, Accepted, fixedTime);

      expect(originalOrder.status).toBe(Pending);
      expect(originalOrder.statusHistory).toHaveLength(1);
      expect(nextOrder).not.toBe(originalOrder);
      expect(nextOrder.status).toBe(Accepted);
    });

    test('grows statusHistory by exactly one entry per transition and injects timestamp', () => {
      const t1 = new Date('2026-11-22T12:00:00.000Z');
      const t2 = new Date('2026-11-22T12:30:00.000Z');
      const t3 = new Date('2026-11-22T13:00:00.000Z');

      const order0 = { id: 'ORD-1001', status: Pending };
      const order1 = transitionOrder(order0, Accepted, t1);

      expect(order1.statusHistory).toHaveLength(1);
      expect(order1.statusHistory[0]).toEqual({ status: Accepted, at: t1 });

      const order2 = transitionOrder(order1, Preparing, t2);
      expect(order2.statusHistory).toHaveLength(2);
      expect(order2.statusHistory[0]).toEqual({ status: Accepted, at: t1 });
      expect(order2.statusHistory[1]).toEqual({ status: Preparing, at: t2 });

      const order3 = transitionOrder(order2, OutForDelivery, t3);
      expect(order3.statusHistory).toHaveLength(3);
      expect(order3.statusHistory[2]).toEqual({ status: OutForDelivery, at: t3 });
    });

    test('defaults timestamp to now if optional third argument is omitted', () => {
      const before = new Date();
      const order = { id: 'ORD-1001', status: Pending };
      const nextOrder = transitionOrder(order, Accepted);
      const after = new Date();

      expect(nextOrder.statusHistory).toHaveLength(1);
      const entryAt = new Date(nextOrder.statusHistory[0].at);
      expect(entryAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entryAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
