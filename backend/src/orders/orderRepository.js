/**
 * backend/src/orders/orderRepository.js
 * In-memory repository for orders with immutable structuredClone returns.
 * Ported and adapted from railbite-old backend/models/orderModel.js.
 */

const { NotFoundError } = require('./errors');

const clone = (data) => {
  if (data === undefined || data === null) return data;
  if (typeof structuredClone === 'function') {
    return structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data));
};

/**
 * Creates an in-memory order repository.
 * @param {Array<object>} [initial=[]]
 * @returns {object} repository interface
 */
const createOrderRepository = (initial = []) => {
  let orders = initial.map((order) => clone(order));

  return {
    /**
     * Stores an order and returns a cloned copy.
     * @param {object} order
     * @returns {object} cloned order
     */
    add(order) {
      const copy = clone(order);
      orders.push(copy);
      return clone(copy);
    },

    /**
     * Finds an order by its unique ID.
     * @param {string} id
     * @returns {object|null} cloned order or null
     */
    getById(id) {
      const found = orders.find((o) => o.id === id);
      return found ? clone(found) : null;
    },

    /**
     * Lists all orders belonging to a specific vendor.
     * @param {string} vendorId
     * @returns {Array<object>} array of cloned orders
     */
    listByVendor(vendorId) {
      return orders
        .filter((o) => o.vendorId === vendorId)
        .map((o) => clone(o));
    },

    /**
     * Updates an existing order. Throws NotFoundError if not found.
     * @param {object} order
     * @returns {object} cloned updated order
     */
    update(order) {
      const index = orders.findIndex((o) => o.id === order.id);
      if (index === -1) {
        throw new NotFoundError(`Order "${order.id}" not found`);
      }
      orders[index] = clone(order);
      return clone(orders[index]);
    },

    /**
     * Clears all stored orders.
     */
    clear() {
      orders = [];
    },
  };
};

const defaultOrderRepository = createOrderRepository();

module.exports = {
  createOrderRepository,
  defaultOrderRepository,
};
