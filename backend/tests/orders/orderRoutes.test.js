const express = require('express');
const request = require('supertest');
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} = require('../../src/orders/errors');
const { InvalidTransitionError } = require('../../src/orders/orderStateMachine');
const {
  createOrderRepository,
  defaultOrderRepository,
} = require('../../src/orders/orderRepository');
const { toPublicOrder } = require('../../src/orders/orderView');
const { createOrdersRouter } = require('../../src/orders/orderRoutes');
const { ORDER_STATUS } = require('../../src/orders/orderStatus');

describe('RB-402: Orders API for a vendor', () => {
  describe('errors.js', () => {
    test('NotFoundError has statusCode 404 and code NOT_FOUND', () => {
      const err = new NotFoundError('Order not found');
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
      expect(err.message).toBe('Order not found');
    });

    test('ValidationError has statusCode 400 and code VALIDATION_ERROR', () => {
      const err = new ValidationError('Invalid status filter');
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.message).toBe('Invalid status filter');
    });

    test('ForbiddenError has statusCode 403 and code FORBIDDEN', () => {
      const err = new ForbiddenError('Access forbidden');
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
      expect(err.message).toBe('Access forbidden');
    });

    test('re-exports InvalidTransitionError with statusCode 400 and code INVALID_TRANSITION', () => {
      const err = new InvalidTransitionError('Pending', 'Delivered');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('INVALID_TRANSITION');
    });
  });

  describe('orderRepository.js', () => {
    let repo;

    const sampleOrder = {
      id: 'ORD-101',
      pnr: '1234567890',
      vendorId: 'V1',
      vendorName: 'Haldiram',
      station: { code: 'NDLS', name: 'New Delhi' },
      arrivalTime: '14:30',
      arrivalDayOffset: 0,
      items: [{ itemId: 'item-1', name: 'Thali', price: 200, quantity: 1 }],
      totalAmount: 200,
      status: ORDER_STATUS.Pending,
      statusHistory: [{ status: ORDER_STATUS.Pending, at: '2026-11-26T12:00:00Z' }],
      createdAt: '2026-11-26T12:00:00Z',
      paymentRef: 'TXN123',
    };

    beforeEach(() => {
      repo = createOrderRepository();
    });

    test('add and getById returns a clone of the order', () => {
      repo.add(sampleOrder);
      const retrieved = repo.getById('ORD-101');
      expect(retrieved).toEqual(sampleOrder);
      expect(retrieved).not.toBe(sampleOrder);

      retrieved.totalAmount = 999;
      expect(repo.getById('ORD-101').totalAmount).toBe(200);
    });

    test('getById returns null if not found', () => {
      expect(repo.getById('NON-EXISTENT')).toBeNull();
    });

    test('listByVendor returns all matching orders for vendor and isolates vendors', () => {
      repo.add({ ...sampleOrder, id: 'ORD-1', vendorId: 'V1' });
      repo.add({ ...sampleOrder, id: 'ORD-2', vendorId: 'V2' });
      repo.add({ ...sampleOrder, id: 'ORD-3', vendorId: 'V1' });

      const v1Orders = repo.listByVendor('V1');
      expect(v1Orders).toHaveLength(2);
      expect(v1Orders.map((o) => o.id)).toEqual(['ORD-1', 'ORD-3']);

      const v2Orders = repo.listByVendor('V2');
      expect(v2Orders).toHaveLength(1);
      expect(v2Orders[0].id).toBe('ORD-2');

      const v3Orders = repo.listByVendor('V3');
      expect(v3Orders).toEqual([]);
    });

    test('listByVendor returns structuredClone copies so mutation does not affect store', () => {
      repo.add(sampleOrder);
      const list = repo.listByVendor('V1');
      list[0].items[0].quantity = 99;
      expect(repo.getById('ORD-101').items[0].quantity).toBe(1);
    });

    test('update replaces the order and returns a clone', () => {
      repo.add(sampleOrder);
      const updatedOrder = { ...sampleOrder, status: ORDER_STATUS.Accepted };
      const res = repo.update(updatedOrder);
      expect(res.status).toBe(ORDER_STATUS.Accepted);
      expect(repo.getById('ORD-101').status).toBe(ORDER_STATUS.Accepted);
    });

    test('update throws NotFoundError if order id does not exist', () => {
      expect(() => {
        repo.update({ id: 'ORD-999', status: ORDER_STATUS.Accepted });
      }).toThrow(NotFoundError);
    });

    test('clear removes all orders', () => {
      repo.add(sampleOrder);
      expect(repo.listByVendor('V1')).toHaveLength(1);
      repo.clear();
      expect(repo.listByVendor('V1')).toHaveLength(0);
      expect(repo.getById('ORD-101')).toBeNull();
    });

    test('defaultOrderRepository is exported as empty repository instance', () => {
      expect(defaultOrderRepository).toBeDefined();
      expect(typeof defaultOrderRepository.add).toBe('function');
      expect(typeof defaultOrderRepository.clear).toBe('function');
    });
  });

  describe('orderView.js: toPublicOrder', () => {
    test('removes pnr, adds pnrLast4, and does not mutate the input', () => {
      const order = {
        id: 'ORD-1',
        pnr: '1234567890',
        vendorId: 'V1',
        totalAmount: 250,
      };

      const publicOrder = toPublicOrder(order);

      expect(publicOrder.pnr).toBeUndefined();
      expect(publicOrder.pnrLast4).toBe('7890');
      expect(publicOrder.id).toBe('ORD-1');
      expect(publicOrder.vendorId).toBe('V1');
      expect(order.pnr).toBe('1234567890');
      expect(order.pnrLast4).toBeUndefined();
    });

    test('handles pnr with less than 4 digits gracefully', () => {
      const order = { id: 'ORD-2', pnr: '12' };
      const publicOrder = toPublicOrder(order);
      expect(publicOrder.pnr).toBeUndefined();
      expect(publicOrder.pnrLast4).toBe('12');
    });

    test('handles missing or non-string pnr safely', () => {
      const order = { id: 'ORD-3' };
      const publicOrder = toPublicOrder(order);
      expect(publicOrder.pnr).toBeUndefined();
      expect(publicOrder.pnrLast4).toBe('');
    });

    test('returns primitive or null input safely', () => {
      expect(toPublicOrder(null)).toBeNull();
      expect(toPublicOrder(undefined)).toBeUndefined();
    });
  });

  describe('orderRoutes.js: Express Router endpoints', () => {
    let app;
    let repo;

    const baseOrder = {
      id: 'ORD-101',
      pnr: '9876543210',
      vendorId: 'vendor-1',
      vendorName: 'Bikaner Sweets',
      station: { code: 'CNB', name: 'Kanpur Central' },
      arrivalTime: '10:00',
      arrivalDayOffset: 0,
      items: [{ itemId: 'i-1', name: 'Samosa', price: 30, quantity: 2 }],
      totalAmount: 60,
      status: ORDER_STATUS.Pending,
      statusHistory: [{ status: ORDER_STATUS.Pending, at: '2026-11-26T08:00:00Z' }],
      createdAt: '2026-11-26T08:00:00Z',
      paymentRef: 'PAY-1',
    };

    beforeEach(() => {
      repo = createOrderRepository();
      app = express();
      app.use(express.json());
      app.use('/api/orders', createOrdersRouter({ repository: repo }));
    });

    describe('Router initialization', () => {
      test('createOrdersRouter initializes router with default options', () => {
        const router = createOrdersRouter();
        expect(router).toBeDefined();
        expect(typeof router).toBe('function');
      });
    });

    describe('GET /api/orders?vendorId=ID', () => {
      test('200: returns { orders: [...] } with public view (no pnr, has pnrLast4)', async () => {
        repo.add(baseOrder);

        const res = await request(app).get('/api/orders?vendorId=vendor-1');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('orders');
        expect(res.body.orders).toHaveLength(1);
        expect(res.body.orders[0].pnr).toBeUndefined();
        expect(res.body.orders[0].pnrLast4).toBe('3210');
        expect(res.body.orders[0].id).toBe('ORD-101');
      });

      test('200: unknown vendor returns { orders: [] }', async () => {
        repo.add(baseOrder);

        const res = await request(app).get('/api/orders?vendorId=unknown-vendor');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ orders: [] });
      });

      test('400: missing vendorId parameter returns error body without stack trace', async () => {
        const res = await request(app).get('/api/orders');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
          message: 'Missing required query parameter: vendorId',
          code: 'VALIDATION_ERROR',
        });
        expect(res.body.stack).toBeUndefined();
      });

      test('400: blank vendorId parameter returns error body', async () => {
        const res = await request(app).get('/api/orders?vendorId=  ');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
          message: 'Missing required query parameter: vendorId',
          code: 'VALIDATION_ERROR',
        });
      });

      test('200: sorts by arrivalDayOffset, then arrivalTime, then createdAt', async () => {
        repo.add({
          ...baseOrder,
          id: 'ORD-1',
          arrivalDayOffset: 1,
          arrivalTime: '02:00',
          createdAt: '2026-11-26T01:00:00Z',
        });
        repo.add({
          ...baseOrder,
          id: 'ORD-2',
          arrivalDayOffset: 0,
          arrivalTime: '15:00',
          createdAt: '2026-11-26T02:00:00Z',
        });
        repo.add({
          ...baseOrder,
          id: 'ORD-3',
          arrivalDayOffset: 0,
          arrivalTime: '09:00',
          createdAt: '2026-11-26T03:00:00Z',
        });
        repo.add({
          ...baseOrder,
          id: 'ORD-4',
          arrivalDayOffset: 0,
          arrivalTime: '09:00',
          createdAt: '2026-11-26T01:00:00Z',
        });

        const res = await request(app).get('/api/orders?vendorId=vendor-1');

        expect(res.status).toBe(200);
        const ids = res.body.orders.map((o) => o.id);
        // ORD-4 (day 0, 09:00, created 01:00)
        // ORD-3 (day 0, 09:00, created 03:00)
        // ORD-2 (day 0, 15:00)
        // ORD-1 (day 1, 02:00)
        expect(ids).toEqual(['ORD-4', 'ORD-3', 'ORD-2', 'ORD-1']);
      });

      test('200: status filter returns only matching orders', async () => {
        repo.add({ ...baseOrder, id: 'ORD-P', status: ORDER_STATUS.Pending });
        repo.add({ ...baseOrder, id: 'ORD-A', status: ORDER_STATUS.Accepted });
        repo.add({ ...baseOrder, id: 'ORD-D', status: ORDER_STATUS.Delivered });

        const res = await request(app).get('/api/orders?vendorId=vendor-1&status=Accepted');

        expect(res.status).toBe(200);
        expect(res.body.orders).toHaveLength(1);
        expect(res.body.orders[0].id).toBe('ORD-A');
        expect(res.body.orders[0].status).toBe(ORDER_STATUS.Accepted);
      });

      test('400: unknown status filter returns error', async () => {
        const res = await request(app).get('/api/orders?vendorId=vendor-1&status=InvalidStatus');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
          message: 'Unknown status filter: InvalidStatus',
          code: 'VALIDATION_ERROR',
        });
      });

      test('vendor isolation: vendor A never sees vendor B orders', async () => {
        repo.add({ ...baseOrder, id: 'ORD-A1', vendorId: 'vendor-A' });
        repo.add({ ...baseOrder, id: 'ORD-B1', vendorId: 'vendor-B' });

        const resA = await request(app).get('/api/orders?vendorId=vendor-A');
        expect(resA.status).toBe(200);
        expect(resA.body.orders.map((o) => o.id)).toEqual(['ORD-A1']);

        const resB = await request(app).get('/api/orders?vendorId=vendor-B');
        expect(resB.status).toBe(200);
        expect(resB.body.orders.map((o) => o.id)).toEqual(['ORD-B1']);
      });
    });

    describe('GET /api/orders/:id', () => {
      test('200: returns { order } with public view', async () => {
        repo.add(baseOrder);

        const res = await request(app).get('/api/orders/ORD-101');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('order');
        expect(res.body.order.id).toBe('ORD-101');
        expect(res.body.order.pnr).toBeUndefined();
        expect(res.body.order.pnrLast4).toBe('3210');
      });

      test('404: not found order returns error body', async () => {
        const res = await request(app).get('/api/orders/NON-EXISTENT');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
          message: 'Order "NON-EXISTENT" not found',
          code: 'NOT_FOUND',
        });
        expect(res.body.stack).toBeUndefined();
      });
    });
  });
});
