/**
 * backend/src/middleware/asyncHandler.js
 * RB-202: Wraps async route handlers so Promise rejections reach errorHandler.
 */
'use strict';

/**
 * @param {Function} fn  Async route handler (req, res, next) => Promise
 * @returns Express middleware
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
