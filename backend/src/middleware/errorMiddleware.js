/**
 * backend/src/middleware/errorMiddleware.js
 * RB-202: notFoundHandler and errorHandler.
 *
 * Ported from: railbite-old/backend/middleware/errorMiddleware.js
 *   Old behaviour: single function, used err.status, logged to console.error,
 *   responded { success, error } — no code field, no body-parser handling,
 *   no production/dev split, no injected logger.
 *   This is a full rewrite to the RB-202 contract.
 */
'use strict';

/**
 * 404 handler — must be registered AFTER all real routes.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
}

/**
 * Central error handler factory.
 * @param {{ nodeEnv?: string, logger?: { error: Function } }} options
 * @returns Express error-handler middleware
 */
function errorHandler({ nodeEnv = 'development', logger } = {}) {
  // eslint-disable-next-line no-unused-vars
  return function handleError(err, req, res, next) {
    // If headers already sent, delegate to Express default.
    if (res.headersSent) {
      return next(err);
    }

    // ── body-parser errors ────────────────────────────────────────────────
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'Malformed JSON', code: 'INVALID_JSON' });
    }
    if (err.type === 'entity.too.large' || err.status === 413) {
      return res.status(413).json({ message: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' });
    }

    // ── determine status and code ─────────────────────────────────────────
    const statusCode =
      typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode <= 599
        ? err.statusCode
        : 500;

    const is5xx = statusCode >= 500;
    const message = is5xx ? 'Something went wrong' : err.message || 'Something went wrong';
    const code = is5xx ? 'INTERNAL_ERROR' : err.code || 'INTERNAL_ERROR';

    // ── log 5xx through the injected logger ──────────────────────────────
    if (is5xx && logger && typeof logger.error === 'function') {
      logger.error(`[${statusCode}] ${req.method} ${req.originalUrl} — ${err.message}`);
    }

    // ── build response body ───────────────────────────────────────────────
    const body = { message, code };
    if (nodeEnv === 'development') {
      body.stack = err.stack;
    }

    return res.status(statusCode).json(body);
  };
}

module.exports = { notFoundHandler, errorHandler };
