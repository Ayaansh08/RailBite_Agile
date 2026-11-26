const PNR_REGEX = /^\d{10}$/;

export function isValidPnr(pnr) {
  return typeof pnr === 'string' && PNR_REGEX.test(pnr);
}
