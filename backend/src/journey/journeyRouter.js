const express = require('express');
const { getJourneyByPnr, ValidationError, NotFoundError } = require('./journeyService');

const router = express.Router();

router.post('/lookup', (req, res, next) => {
  try {
    const { pnr } = req.body || {};
    const journey = getJourneyByPnr(pnr);
    return res.status(200).json({
      success: true,
      data: journey,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        error: err.message,
      });
    }
    next(err);
  }
});

module.exports = router;
