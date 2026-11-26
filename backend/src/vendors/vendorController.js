/**
 * src/vendors/vendorController.js
 * Request/response handling for vendor endpoints.
 */

const { getVendorsByStation } = require('./vendorService');

/**
 * GET /api/vendors?station=CODE
 * Fetches vendors for a given railway station.
 */
const getVendors = (req, res) => {
  try {
    const { station } = req.query;
    const vendors = getVendorsByStation(station);
    return res.status(200).json({
      vendors,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

module.exports = {
  getVendors,
};
