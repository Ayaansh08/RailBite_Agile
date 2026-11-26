/**
 * journey/errors.js
 * Domain errors and stable error codes for journey service.
 */

const ERROR_CODES = {
  INVALID_PNR: 'INVALID_PNR',
  PNR_NOT_FOUND: 'PNR_NOT_FOUND',
  JOURNEY_COMPLETED: 'JOURNEY_COMPLETED',
};

class JourneyError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

class ValidationError extends JourneyError {
  constructor(message) {
    super(message, 400, ERROR_CODES.INVALID_PNR);
  }
}

class NotFoundError extends JourneyError {
  constructor(message) {
    super(message, 404, ERROR_CODES.PNR_NOT_FOUND);
  }
}

class JourneyCompletedError extends JourneyError {
  constructor(message = 'This journey has already ended.') {
    super(message, 410, ERROR_CODES.JOURNEY_COMPLETED);
  }
}

module.exports = {
  ERROR_CODES,
  JourneyError,
  ValidationError,
  NotFoundError,
  JourneyCompletedError,
};
