const express = require('express');
const { getJourneyByPnr, ValidationError, NotFoundError } = require('./journeyService');
const { getArrivalTimes } = require('./arrivalTimes');

function handleJourneyError(err, res, next) {
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
  return next(err);
}

function createJourneyRouter(clock = () => new Date()) {
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
      return handleJourneyError(err, res, next);
    }
  });

  router.get('/:pnr/route', (req, res, next) => {
    try {
      const journey = getJourneyByPnr(req.params.pnr);
      const { currentStation, nextStation, upcomingStations } = getArrivalTimes(journey, clock());
      return res.status(200).json({
        pnr: journey.pnr,
        trainNo: journey.trainNumber,
        trainName: journey.trainName,
        currentStation,
        nextStation,
        upcomingStations,
      });
    } catch (err) {
      return handleJourneyError(err, res, next);
    }
  });

  return router;
}

const defaultRouter = createJourneyRouter();
defaultRouter.createJourneyRouter = createJourneyRouter;

module.exports = defaultRouter;
