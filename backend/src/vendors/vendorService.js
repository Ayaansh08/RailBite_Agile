/**
 * src/vendors/vendorService.js
 * Business logic for retrieving vendors by station code.
 */

const { mockVendors } = require('./data/mockVendors');

/**
 * Retrieves all vendors located at the specified railway station code.
 *
 * @param {string} stationCode - Railway station code (case-insensitive)
 * @returns {Array<object>} Array of vendors sorted alphabetically by name
 * @throws {Error} If stationCode is missing, null, empty, or whitespace-only
 */
const getVendorsByStation = (stationCode) => {
  if (!stationCode || typeof stationCode !== 'string' || stationCode.trim() === '') {
    throw new Error('Station code is required');
  }

  const normalizedStation = stationCode.trim().toUpperCase();

  const matchingVendors = mockVendors.filter(
    (vendor) => vendor.stationCode.toUpperCase() === normalizedStation
  );

  return matchingVendors.sort((a, b) => a.name.localeCompare(b.name));
};

module.exports = {
  getVendorsByStation,
};
