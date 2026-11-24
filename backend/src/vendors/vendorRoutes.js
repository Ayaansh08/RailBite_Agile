/**
 * src/vendors/vendorRoutes.js
 * Express router for vendor routes.
 */

const express = require('express');
const { getVendors } = require('./vendorController');

const router = express.Router();

router.get('/', getVendors);

module.exports = router;
