/**
 * backend/src/orders/orderView.js
 * Public projection of orders masking sensitive PNR information.
 */

/**
 * Transforms an internal order object into a public view by removing the full PNR
 * and exposing only the last 4 digits (pnrLast4).
 *
 * @param {object} order - Raw internal order object
 * @returns {object} Masked public order copy
 */
const toPublicOrder = (order) => {
  if (!order || typeof order !== 'object') {
    return order;
  }

  const { pnr, ...rest } = order;
  const pnrLast4 = pnr ? String(pnr).slice(-4) : '';

  return {
    ...rest,
    pnrLast4,
  };
};

module.exports = {
  toPublicOrder,
};
