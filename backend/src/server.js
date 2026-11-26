/**
 * backend/src/server.js
 * RB-201: Entrypoint — calls createApp and starts the HTTP server.
 * Not covered by tests (excluded in jest.config.js).
 *
 * Ported from: railbite-old/backend/server.js (app.listen was inline).
 */
'use strict';

require('dotenv').config();

const { loadConfig } = require('./config/env');
const { createApp } = require('./app');
const { buildMounts } = require('./routes/index');

const config = loadConfig(process.env);
const app = createApp({
  mounts: buildMounts({ config }),
  corsOrigin: config.corsOrigin,
  nodeEnv: config.nodeEnv,
  logger: console,
});

app.listen(config.port, () => {
  console.log(`RailBite backend running on http://localhost:${config.port}`);
  console.log(`  GET  http://localhost:${config.port}/api/health`);
  console.log(`  POST http://localhost:${config.port}/api/journey/lookup`);
  console.log(`  GET  http://localhost:${config.port}/api/vendors`);
});
