const request = require('supertest');
const { getJourneyByPnr, ValidationError, NotFoundError } = require('../../src/journey/journeyService');
const app = require('../../src/app');

describe('RB-102: PNR Lookup', () => {
  describe('Unit: getJourneyByPnr(pnr)', () => {
    test('returns the journey object with train details and stations for known PNR', () => {
      const journey = getJourneyByPnr('1234567890');
      expect(journey).toBeDefined();
      expect(journey.pnr).toBe('1234567890');
      expect(journey.trainNumber).toBe('12009');
      expect(journey.trainName).toBe('Shatabdi Express');
      expect(Array.isArray(journey.journeyStations)).toBe(true);
      expect(journey.journeyStations.length).toBeGreaterThan(0);
      expect(journey.journeyStations[0]).toHaveProperty('code');
      expect(journey.journeyStations[0]).toHaveProperty('departureTime');
    });

    test('throws ValidationError for invalid PNR formats', () => {
      expect(() => getJourneyByPnr('123')).toThrow(ValidationError);
      expect(() => getJourneyByPnr('invalidpnr')).toThrow(ValidationError);
      expect(() => getJourneyByPnr(null)).toThrow(ValidationError);
      expect(() => getJourneyByPnr('')).toThrow(ValidationError);
    });

    test('throws NotFoundError for unknown 10-digit PNR', () => {
      expect(() => getJourneyByPnr('9999999999')).toThrow(NotFoundError);
      expect(() => getJourneyByPnr('0000000000')).toThrow(NotFoundError);
    });
  });

  describe('Integration: POST /api/journey/lookup', () => {
    test('200: returns journey data when valid known PNR is provided', async () => {
      const res = await request(app)
        .post('/api/journey/lookup')
        .send({ pnr: '1234567890' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.pnr).toBe('1234567890');
      expect(res.body.data.trainName).toBe('Shatabdi Express');
    });

    test('400: returns validation error when PNR is invalid or missing', async () => {
      const resInvalid = await request(app)
        .post('/api/journey/lookup')
        .send({ pnr: 'abc' });
      expect(resInvalid.status).toBe(400);
      expect(resInvalid.body.success).toBe(false);
      expect(resInvalid.body.error).toBeDefined();

      const resMissing = await request(app)
        .post('/api/journey/lookup')
        .send({});
      expect(resMissing.status).toBe(400);
      expect(resMissing.body.success).toBe(false);
    });

    test('404: returns not found error when PNR is not in database', async () => {
      const res = await request(app)
        .post('/api/journey/lookup')
        .send({ pnr: '9999999999' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });
});
