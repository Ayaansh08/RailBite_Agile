/**
 * backend/src/orders/orderRoutes.js
 * Express router for vendor order queries and fulfillment operations.
 * Ported and adapted from railbite-old backend/controllers/orderController.js
 * and backend/routes/orderRoutes.js.
 */

const express = require('express');
const { defaultOrderRepository } = require('./orderRepository');
const { toPublicOrder } = require('./orderView');
const { ORDER_STATUS } = require('./orderStatus');
const { ValidationError, NotFoundError } = require('./errors');

/**
 * Comparator sorting orders by:
 * 1) arrivalDayOffset ascending (e.g. 0 today, 1 tomorrow)
 * 2) arrivalTime ascending ("HH:mm")
 * 3) createdAt ascending timestamp
 */
const compareOrdersByArrivalAndCreation = (a, b) => {
  const dayOffsetA = a.arrivalDayOffset ?? 0;
  const dayOffsetB = b.arrivalDayOffset ?? 0;
  if (dayOffsetA !== dayOffsetB) {
    return dayOffsetA - dayOffsetB;
  }

  const timeA = a.arrivalTime || '';
  const timeB = b.arrivalTime || '';
  const timeComp = timeA.localeCompare(timeB);
  if (timeComp !== 0) {
    return timeComp;
  }

  const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return createdA - createdB;
};

/**
 * Creates an Express router configured with the given repository and clock.
 *
 * @param {object} options
 * @param {object} [options.repository=defaultOrderRepository]
 * @param {Function} [options.clock=() => new Date()]
 * @returns {express.Router}
 */
const createOrdersRouter = ({
  repository = defaultOrderRepository,
  clock = () => new Date(),
} = {}) => {
  const router = express.Router();

  // GET / - List orders for a vendor with optional status filter
  router.get('/', (req, res, next) => {
    try {
      const { vendorId, status } = req.query;

      if (!vendorId || !vendorId.trim()) {
        throw new ValidationError('Missing required query parameter: vendorId');
      }

      if (status && !Object.values(ORDER_STATUS).includes(status)) {
        throw new ValidationError(`Unknown status filter: ${status}`);
      }

      let orders = repository.listByVendor(vendorId.trim());

      if (status) {
        orders = orders.filter((order) => order.status === status);
      }

      orders.sort(compareOrdersByArrivalAndCreation);

      const publicOrders = orders.map((order) => toPublicOrder(order));

      res.status(200).json({ orders: publicOrders });
    } catch (err) {
      next(err);
    }
  });

  // GET /:id - Get single order by ID
  router.get('/:id', (req, res, next) => {
    try {
      const { id } = req.params;
      const order = repository.getById(id);

      if (!order) {
        throw new NotFoundError(`Order "${id}" not found`);
      }

      res.status(200).json({ order: toPublicOrder(order) });
    } catch (err) {
      next(err);
    }
  });

  // Standardized error handler for the orders router
  router.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';

    res.status(statusCode).json({
      message: err.message,
      code,
    });
  });

  return router;
};

module.exports = {
  createOrdersRouter,
};
