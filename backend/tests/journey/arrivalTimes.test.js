const express = require('express');
const request = require('supertest');
const { getArrivalTimes } = require('../../src/journey/arrivalTimes');
const { createJourneyRouter } = require('../../src/journey/journeyRouter');
const { ValidationError } = require('../../src/journey/errors');

const DAYTIME_JOURNEY = {
  pnr: '1234567890',
  trainNumber: '12009',
  trainName: 'Shatabdi Express',
  departure: '2026-04-29T10:00:00',
  delayMinutes: 0,
  journeyStations: [
    { code: 'NDLS', name: 'New Delhi', stopType: 'starting', arrivalTime: null, departureTime: '10:00' },
    { code: 'KURJ', name: 'Kurukshetra', stopType: 'halting', arrivalTime: '11:45', departureTime: '11:47' },
    { code: 'AGC', name: 'Agra Cantt', stopType: 'halting', arrivalTime: '13:20', departureTime: '13:22' },
    { code: 'LKO', name: 'Lucknow', stopType: 'destination', arrivalTime: '23:30', departureTime: null },
  ],
};

const OVERNIGHT_JOURNEY = {
  pnr: '9876543210',
  trainNumber: '12301',
  trainName: 'Rajdhani Express',
  departure: '2026-04-29T16:55:00',
  delayMinutes: 0,
  journeyStations: [
    { code: 'NDLS', name: 'New Delhi', stopType: 'starting', arrivalTime: null, departureTime: '16:55' },
    { code: 'GAYA', name: 'Gaya Jn', stopType: 'halting', arrivalTime: '00:52', departureTime: '00:54' },
    { code: 'DHN', name: 'Dhanbad Jn', stopType: 'halting', arrivalTime: '04:30', departureTime: '04:32' },
    { code: 'HWH', name: 'Howrah', stopType: 'destination', arrivalTime: '09:55', departureTime: null },
  ],
};

describe('getArrivalTimes (RB-104)', () => {
  const daytimeNow = new Date('2026-04-29T11:00:00');

  test('returns scheduled arrival times and dayOffset 0 with zero delay', () => {
    const result = getArrivalTimes(DAYTIME_JOURNEY, daytimeNow, 0);

    expect(result.currentStation).toBeNull();
    expect(result.nextStation.code).toBe('KURJ');
    expect(result.upcomingStations).toEqual([
      { code: 'KURJ', name: 'Kurukshetra', scheduledTime: '11:45', arrivalTime: '11:45', dayOffset: 0 },
      { code: 'AGC', name: 'Agra Cantt', scheduledTime: '13:20', arrivalTime: '13:20', dayOffset: 0 },
      { code: 'LKO', name: 'Lucknow', scheduledTime: '23:30', arrivalTime: '23:30', dayOffset: 0 },
    ]);
  });

  test('adds small delay to upcoming station arrival times', () => {
    const result = getArrivalTimes(DAYTIME_JOURNEY, daytimeNow, 25);

    expect(result.upcomingStations).toEqual([
      { code: 'KURJ', name: 'Kurukshetra', scheduledTime: '11:45', arrivalTime: '12:10', dayOffset: 0 },
      { code: 'AGC', name: 'Agra Cantt', scheduledTime: '13:20', arrivalTime: '13:45', dayOffset: 0 },
      { code: 'LKO', name: 'Lucknow', scheduledTime: '23:30', arrivalTime: '23:55', dayOffset: 0 },
    ]);
  });

  test('handles delay pushing a station past midnight with dayOffset 1', () => {
    const result = getArrivalTimes(DAYTIME_JOURNEY, daytimeNow, 45);
    const lko = result.upcomingStations.find((s) => s.code === 'LKO');

    expect(lko).toEqual({
      code: 'LKO',
      name: 'Lucknow',
      scheduledTime: '23:30',
      arrivalTime: '00:15',
      dayOffset: 1,
    });
  });

  test('handles journey already crossing midnight plus additional delay', () => {
    const now = new Date('2026-04-29T20:00:00');
    const result = getArrivalTimes(OVERNIGHT_JOURNEY, now, 30);

    expect(result.upcomingStations).toEqual([
      { code: 'GAYA', name: 'Gaya Jn', scheduledTime: '00:52', arrivalTime: '01:22', dayOffset: 1 },
      { code: 'DHN', name: 'Dhanbad Jn', scheduledTime: '04:30', arrivalTime: '05:00', dayOffset: 1 },
      { code: 'HWH', name: 'Howrah', scheduledTime: '09:55', arrivalTime: '10:25', dayOffset: 1 },
    ]);
  });

  test('accepts delayMinutes at 1440 boundary', () => {
    const result = getArrivalTimes(DAYTIME_JOURNEY, daytimeNow, 1440);

    expect(result.upcomingStations[0]).toEqual({
      code: 'KURJ',
      name: 'Kurukshetra',
      scheduledTime: '11:45',
      arrivalTime: '11:45',
      dayOffset: 1,
    });
  });

  test('uses journey.delayMinutes when delayMinutes argument is omitted', () => {
    const delayedJourney = { ...DAYTIME_JOURNEY, delayMinutes: 15 };
    const result = getArrivalTimes(delayedJourney, daytimeNow);

    expect(result.upcomingStations[0].arrivalTime).toBe('12:00');
  });

  test.each([1441, -1, -30, 1.5, NaN, '10', null])(
    'rejects invalid delayMinutes (%p) with ValidationError',
    (badDelay) => {
      expect(() => getArrivalTimes(DAYTIME_JOURNEY, daytimeNow, badDelay)).toThrow(ValidationError);
    }
  );

  test('returns empty upcomingStations when all stations have passed', () => {
    const afterJourney = new Date('2026-04-30T02:00:00');
    const result = getArrivalTimes(DAYTIME_JOURNEY, afterJourney, 0);

    expect(result.currentStation).toBeNull();
    expect(result.nextStation).toBeNull();
    expect(result.upcomingStations).toEqual([]);
  });

  test('does not mutate the input journey object', () => {
    const snapshot = JSON.parse(JSON.stringify(DAYTIME_JOURNEY));
    getArrivalTimes(DAYTIME_JOURNEY, daytimeNow, 45);

    expect(DAYTIME_JOURNEY).toEqual(snapshot);
  });
});

describe('GET /api/journey/:pnr/route (RB-104)', () => {
  function buildTestApp(fixedTime) {
    const app = express();
    app.use(express.json());
    const router = createJourneyRouter(() => new Date(fixedTime));
    app.use('/api/journey', router);
    return app;
  }

  test('returns 200 with journeyData contract for a valid PNR', async () => {
    const app = buildTestApp('2026-04-29T11:00:00');
    const res = await request(app).get('/api/journey/1234567890/route');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      pnr: '1234567890',
      trainNo: '12009',
      trainName: 'Shatabdi Express',
      currentStation: null,
      nextStation: expect.objectContaining({ code: 'KURJ', name: 'Kurukshetra' }),
    });
    expect(res.body.upcomingStations).toEqual([
      expect.objectContaining({ code: 'KURJ', name: 'Kurukshetra', arrivalTime: '11:45' }),
      expect.objectContaining({ code: 'AGC', name: 'Agra Cantt', arrivalTime: '13:20' }),
      expect.objectContaining({ code: 'LKO', name: 'Lucknow', arrivalTime: '16:30' }),
    ]);
  });

  test('returns 400 for invalid PNR format', async () => {
    const app = buildTestApp('2026-04-29T11:00:00');
    const res = await request(app).get('/api/journey/12345/route');

    expect(res.status).toBe(400);
  });

  test('returns 404 for unknown PNR', async () => {
    const app = buildTestApp('2026-04-29T11:00:00');
    const res = await request(app).get('/api/journey/9999999999/route');

    expect(res.status).toBe(404);
  });
});
