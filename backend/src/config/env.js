/**
 * backend/src/config/env.js
 * RB-201: loadConfig(env) - centralised config reader.
 * Ported from: railbite-old had no config file (PORT was inline in server.js).
 * This is new code for the story.
 */
'use strict';

const DEV_JWT_SECRET = 'dev-only-change-me-in-production';

/**
 * Load and validate application configuration.
 * @param {object} [env=process.env]
 * @returns {{ port, corsOrigin, jwtSecret, jwtExpiresIn, nodeEnv }}
 */
function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const jwtSecret = env.JWT_SECRET;

  // In production a missing or default secret is a hard startup error.
  if (nodeEnv === 'production') {
    if (!jwtSecret || jwtSecret === 'change-me') {
      throw new Error(
        'JWT_SECRET must be set to a strong secret in production. ' +
          'Got: ' + (jwtSecret ? '"change-me"' : 'undefined')
      );
    }
  }

  return {
    port: parseInt(env.PORT, 10) || 5000,
    corsOrigin: env.CORS_ORIGIN || 'http://localhost:5173',
    jwtSecret: jwtSecret || DEV_JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '8h',
    nodeEnv,
  };
}

module.exports = { loadConfig };
