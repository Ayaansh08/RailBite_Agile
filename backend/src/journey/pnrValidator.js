/**
 * journey/pnrValidator.js
 * Validates PNR format according to RB-101.
 * Must accept exactly 10 digits as a string. Reject letters, spaces,
 * 9 or 11 digits, empty, null, undefined, non-string numbers.
 */

const PNR_REGEX = /^\d{10}$/;

const isValidPnr = (pnr) => {
  if (typeof pnr !== 'string') return false;
  return PNR_REGEX.test(pnr);
};

module.exports = {
  isValidPnr,
};
