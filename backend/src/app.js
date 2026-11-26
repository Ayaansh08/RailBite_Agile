/**
 * backend/src/app.js
 * RB-201: createApp factory — Express MVC skeleton.
 *
 * Ported from: railbite-old/backend/server.js (monolithic) and
 *              the existing minimal app.js from Ayaansh's bootstrap.
 *
 * Changes vs old code:
 *   - Extracted into a factory so tests can create isolated instances.
 *   - Added helmet, configurable CORS origin, 100 kb body limit.
 *   - Error handlers now come from errorMiddleware (RB-202) with injected logger.
 *   - Mounts are injected so this file never imports feature routers directly.
 *
 * Backward compat: also exports a default `app` instance (using buildMounts)
 * so Ayaansh's existing tests that do `require('../../src/app')` still work.
 */
'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

/**
 * Create a configured Express application.
 *
 * @param {object} options
 * @param {{ path: string, router: import('express').Router }[]} [options.mounts=[]]
 * @param {string} [options.corsOrigin]
 * @param {{ error: Function }|null} [options.logger]
 * @param {string} [options.nodeEnv]
 * @returns {import('express').Application}
 */
function createApp({ mounts = [], corsOrigin, logger, nodeEnv } = {}) {
  const app = express();

  // ── Security headers ───────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: corsOrigin || 'http://localhost:5173',
    })
  );

  // ── Body parsing (100 kb limit) ────────────────────────────────────────────
  app.use(express.json({ limit: '100kb' }));

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  // ── Feature routers ────────────────────────────────────────────────────────
  mounts.forEach(({ path, router }) => app.use(path, router));

  // ── 404 and error handlers (must be last) ─────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler({ nodeEnv: nodeEnv || process.env.NODE_ENV || 'development', logger }));

  return app;
}

// ── Default export (backward compat for existing journey & vendor tests) ──────
// Ayaansh's tests do: const app = require('../../src/app')
// They need a real Express app with /api/journey mounted.
const { buildMounts } = require('./routes/index');
const defaultApp = createApp({ mounts: buildMounts({}) });

module.exports = defaultApp;
module.exports.createApp = createApp;
