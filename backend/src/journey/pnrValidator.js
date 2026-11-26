/**
 * journey/pnrValidator.js
 * Validates PNR format according to RB-101.
 * Must accept exactly 10 digits as a string.
 * Rejects letters, spaces, 9 or 11 digits, empty, null, undefined, and non-string types.
 */

const PNR_DIGITS_EXACT = 10;
const PNR_REGEX = /^\d{10}$/;

/**
 * Checks if a given PNR is a valid 10-digit numeric string.
 * @param {unknown} pnr - The candidate PNR value to validate.
 * @returns {boolean} True if valid 10-digit string, false otherwise.
 */
function isValidPnr(pnr) {
  if (typeof pnr !== 'string' || pnr.length !== PNR_DIGITS_EXACT) {
    return false;
  }
  return PNR_REGEX.test(pnr);
}

module.exports = {
  isValidPnr,
};
