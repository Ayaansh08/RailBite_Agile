/**
 * journey/journeyService.js
 * Service for journey lookups.
 */

const mockJourneys = require('./data/mockJourneys');
const { isValidPnr } = require('./pnrValidator');
const { ValidationError, NotFoundError } = require('./errors');

function getJourneyByPnr(pnr) {
  if (!isValidPnr(pnr)) {
    throw new ValidationError('Invalid PNR format. Must be exactly 10 digits.');
  }

  const journey = mockJourneys[pnr];
  if (!journey) {
    throw new NotFoundError(`Journey not found for PNR: ${pnr}`);
  }

  return JSON.parse(JSON.stringify(journey));
}

module.exports = {
  getJourneyByPnr,
  ValidationError,
  NotFoundError,
};
