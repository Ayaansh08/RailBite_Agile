const express = require('express');
const request = require('supertest');
const { createJourneyRouter } = require('../../src/journey/journeyRouter');
const { ERROR_CODES } = require('../../src/journey/errors');

describe('RB-106: Journey error codes and completed journey handling', () => {
  function buildApp(fixedTime) {
    const app = express();
    app.use(express.json());
    app.use('/api/journey', createJourneyRouter(() => new Date(fixedTime)));
    return app;
  }

  test('returns 400 with INVALID_PNR code for invalid PNR', async () => {
    const app = buildApp('2026-04-29T11:00:00');
    const res = await request(app).get('/api/journey/bad-pnr/route');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(ERROR_CODES.INVALID_PNR);
    expect(typeof res.body.message).toBe('string');
    expect(res.body.stack).toBeUndefined();
  });

  test('returns 404 with PNR_NOT_FOUND code for unknown PNR', async () => {
    const app = buildApp('2026-04-29T11:00:00');
    const res = await request(app).get('/api/journey/9999999999/route');

    expect(res.status).toBe(404);
    expect(res.body.code).toBe(ERROR_CODES.PNR_NOT_FOUND);
    expect(typeof res.body.message).toBe('string');
    expect(res.body.stack).toBeUndefined();
  });

  test('returns 410 with JOURNEY_COMPLETED code when all stations have passed', async () => {
    const app = buildApp('2026-04-30T12:00:00');
    const res = await request(app).get('/api/journey/1234567890/route');

    expect(res.status).toBe(410);
    expect(res.body.code).toBe(ERROR_CODES.JOURNEY_COMPLETED);
    expect(res.body.message).toMatch(/completed|ended/i);
    expect(res.body.stack).toBeUndefined();
  });

  test('does not leak stack traces on unexpected internal errors', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/journey', createJourneyRouter(() => {
      throw new Error('Sensitive internal DB stack detail');
    }));

    const res = await request(app).get('/api/journey/1234567890/route');

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('Sensitive internal DB stack detail');
    expect(res.body.stack).toBeUndefined();
  });
});
