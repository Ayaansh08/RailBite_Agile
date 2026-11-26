/**
 * backend/src/orders/errors.js
 * Domain errors for order processing and vendor endpoints.
 */

const { InvalidTransitionError } = require('./orderStateMachine');

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.code = 'NOT_FOUND';
  }
}

class ValidationError extends Error {
  constructor(message = 'Validation error') {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.code = 'VALIDATION_ERROR';
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.code = 'FORBIDDEN';
  }
}

module.exports = {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  InvalidTransitionError,
};
