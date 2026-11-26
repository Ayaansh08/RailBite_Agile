const express = require('express');
const { getJourneyByPnr } = require('./journeyService');
const { getArrivalTimes } = require('./arrivalTimes');
const { ValidationError, NotFoundError, JourneyCompletedError } = require('./errors');

function handleJourneyError(err, res) {
  if (
    err instanceof ValidationError ||
    err instanceof NotFoundError ||
    err instanceof JourneyCompletedError
  ) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      error: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong while fetching journey details.',
  });
}

function createJourneyRouter(clock = () => new Date()) {
  const router = express.Router();

  router.post('/lookup', (req, res) => {
    try {
      const { pnr } = req.body || {};
      const journey = getJourneyByPnr(pnr);
      return res.status(200).json({
        success: true,
        data: journey,
      });
    } catch (err) {
      return handleJourneyError(err, res);
    }
  });

  router.get('/:pnr/route', (req, res) => {
    try {
      const journey = getJourneyByPnr(req.params.pnr);
      const { currentStation, nextStation, upcomingStations } = getArrivalTimes(journey, clock());
      if (upcomingStations.length === 0) {
        throw new JourneyCompletedError('This journey has already ended.');
      }
      return res.status(200).json({
        pnr: journey.pnr,
        trainNo: journey.trainNumber,
        trainName: journey.trainName,
        currentStation,
        nextStation,
        upcomingStations,
      });
    } catch (err) {
      return handleJourneyError(err, res);
    }
  });

  return router;
}

const defaultRouter = createJourneyRouter();
defaultRouter.createJourneyRouter = createJourneyRouter;

module.exports = defaultRouter;
