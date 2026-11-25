/**
 * src/vendors/vendorService.js
 * Business logic for retrieving vendors by station code.
 */

const { mockVendors } = require('./data/mockVendors');

const ERROR_MESSAGES = {
  STATION_REQUIRED: 'Station code is required',
};

/**
 * Normalizes a station code by trimming whitespace and converting to uppercase.
 *
 * @param {string} stationCode
 * @returns {string}
 * @throws {Error} If stationCode is missing, non-string, empty, or whitespace-only
 */
const normalizeStationCode = (stationCode) => {
  if (!stationCode || typeof stationCode !== 'string' || stationCode.trim() === '') {
    throw new Error(ERROR_MESSAGES.STATION_REQUIRED);
  }
  return stationCode.trim().toUpperCase();
};

/**
 * Sorts vendors in ascending alphabetical order by name deterministically.
 *
 * @param {Array<object>} vendors
 * @returns {Array<object>}
 */
const sortVendorsByName = (vendors) => {
  return [...vendors].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Retrieves all vendors located at the specified railway station code.
 *
 * @param {string} stationCode - Railway station code (case-insensitive)
 * @returns {Array<object>} Array of vendors sorted alphabetically by name
 * @throws {Error} If stationCode is missing, null, empty, or whitespace-only
 */
const getVendorsByStation = (stationCode) => {
  const normalizedStation = normalizeStationCode(stationCode);

  const matchingVendors = mockVendors.filter(
    (vendor) => vendor.stationCode.toUpperCase() === normalizedStation
  );

  return sortVendorsByName(matchingVendors);
};

module.exports = {
  getVendorsByStation,
  normalizeStationCode,
  sortVendorsByName,
  ERROR_MESSAGES,
};
