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
  const { station } = req.query;

  if (!station || typeof station !== 'string' || station.trim() === '') {
    return res.status(400).json({
      message: 'Station query parameter is required',
    });
  }

  try {
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
