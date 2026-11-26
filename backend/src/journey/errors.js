/**
 * journey/errors.js
 * Domain errors and stable error codes for journey service.
 */

const ERROR_CODES = {
  INVALID_PNR: 'INVALID_PNR',
  PNR_NOT_FOUND: 'PNR_NOT_FOUND',
  JOURNEY_COMPLETED: 'JOURNEY_COMPLETED',
};

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.code = ERROR_CODES.INVALID_PNR;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
    this.code = ERROR_CODES.PNR_NOT_FOUND;
  }
}

class JourneyCompletedError extends Error {
  constructor(message = 'This journey has already ended.') {
    super(message);
    this.name = 'JourneyCompletedError';
    this.status = 410;
    this.code = ERROR_CODES.JOURNEY_COMPLETED;
  }
}

module.exports = {
  ERROR_CODES,
  ValidationError,
  NotFoundError,
  JourneyCompletedError,
};
