/**
 * backend/src/routes/index.js
 * RB-201: buildMounts — explicit list of { path, router } for the app.
 *
 * journeyRouter exports a default Router instance (with .createJourneyRouter attached).
 * vendorRoutes  exports a plain Router.
 * We call each correctly without editing those files.
 */
'use strict';

const journeyRouter = require('../journey/journeyRouter');
const vendorRouter = require('../vendors/vendorRoutes');

/**
 * Build the route-mount list for createApp.
 * One line per module, explicit and readable.
 *
 * @param {object} _deps  Future dependency injection (auth config, etc.)
 * @returns {{ path: string, router: import('express').Router }[]}
 */
function buildMounts(_deps) {
  return [
    { path: '/api/journey', router: journeyRouter },
    { path: '/api/vendors', router: vendorRouter },
  ];
}

module.exports = { buildMounts };
