/**
 * RB-202: Error-handling middleware — RED tests
 * Tests for notFoundHandler, errorHandler, asyncHandler.
 */
'use strict';

const express = require('express');
const request = require('supertest');

// ─── helpers ─────────────────────────────────────────────────────────────────
function makeApp({ nodeEnv = 'test', logger } = {}) {
  jest.resetModules();
  const {
    notFoundHandler,
    errorHandler,
  } = require('../../src/middleware/errorMiddleware');
  const { asyncHandler } = require('../../src/middleware/asyncHandler');

  const app = express();
  app.use(express.json({ limit: '100kb' }));

  // normal route for asyncHandler tests
  app.get('/async-ok', asyncHandler(async (_req, res) => {
    res.json({ ok: true });
  }));

  app.get('/async-fail', asyncHandler(async () => {
    throw Object.assign(new Error('async boom'), { statusCode: 422, code: 'ASYNC_FAIL' });
  }));

  // headersSent route
  app.get('/headers-sent', (_req, res, next) => {
    res.write('partial');
    const err = new Error('after write');
    err.statusCode = 500;
    next(err);
  });

  // routes that throw various errors
  app.get('/err/with-code', (_req, res, next) => {
    const e = new Error('bad input');
    e.statusCode = 400;
    e.code = 'BAD_INPUT';
    next(e);
  });

  app.get('/err/plain', (_req, res, next) => {
    next(new Error('secret internal detail'));
  });

  app.get('/err/5xx', (_req, res, next) => {
    const e = new Error('db exploded');
    e.statusCode = 503;
    e.code = 'DB_ERROR';
    next(e);
  });

  app.use(notFoundHandler);
  app.use(errorHandler({ nodeEnv, logger }));

  return app;
}

// ─── notFoundHandler ─────────────────────────────────────────────────────────
describe('RB-202 notFoundHandler', () => {
  test('returns 404 { message, code: "NOT_FOUND" } for unknown routes', async () => {
    const app = makeApp();
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
    expect(typeof res.body.message).toBe('string');
  });
});

// ─── errorHandler ────────────────────────────────────────────────────────────
describe('RB-202 errorHandler', () => {
  test('4xx error with code passes statusCode and code through', async () => {
    const app = makeApp();
    const res = await request(app).get('/err/with-code');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('bad input');
    expect(res.body.code).toBe('BAD_INPUT');
  });

  test('plain Error (no statusCode) becomes 500 with generic message', async () => {
    const app = makeApp();
    const res = await request(app).get('/err/plain');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Something went wrong');
    expect(res.body.message).not.toContain('secret internal detail');
    expect(res.body.code).toBe('INTERNAL_ERROR');
  });

  test('5xx error always uses generic message regardless of err.message', async () => {
    const app = makeApp();
    const res = await request(app).get('/err/5xx');
    expect(res.status).toBe(503);
    expect(res.body.message).toBe('Something went wrong');
  });

  test('no stack in test/production environment', async () => {
    const app = makeApp({ nodeEnv: 'test' });
    const res = await request(app).get('/err/plain');
    expect(res.body.stack).toBeUndefined();
  });

  test('no stack in production environment', async () => {
    const app = makeApp({ nodeEnv: 'production' });
    const res = await request(app).get('/err/plain');
    expect(res.body.stack).toBeUndefined();
  });

  test('stack IS present in development environment', async () => {
    const app = makeApp({ nodeEnv: 'development' });
    const res = await request(app).get('/err/plain');
    expect(res.body.stack).toBeDefined();
  });

  test('malformed JSON body returns 400 INVALID_JSON', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/async-ok')
      .set('Content-Type', 'application/json')
      .send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_JSON');
  });

  test('oversized JSON body returns 413 PAYLOAD_TOO_LARGE', async () => {
    const app = makeApp();
    const bigBody = JSON.stringify({ data: 'x'.repeat(102 * 1024) });
    const res = await request(app)
      .post('/async-ok')
      .set('Content-Type', 'application/json')
      .send(bigBody);
    expect(res.status).toBe(413);
    expect(res.body.code).toBe('PAYLOAD_TOO_LARGE');
  });

  test('logs 5xx through injected logger', async () => {
    const logger = { error: jest.fn() };
    const app = makeApp({ logger });
    await request(app).get('/err/plain');
    expect(logger.error).toHaveBeenCalled();
  });

  test('does not log 4xx through the logger', async () => {
    const logger = { error: jest.fn() };
    const app = makeApp({ logger });
    await request(app).get('/err/with-code');
    expect(logger.error).not.toHaveBeenCalled();
  });

  test('when headers already sent, delegates to next(err)', async () => {
    // The headers-sent route writes partial body then calls next(err).
    // The response should end without a double-write crash.
    const app = makeApp();
    const res = await request(app).get('/headers-sent');
    // Response will be a 200 (from the write call) but should not crash
    expect([200, 500]).toContain(res.status);
  });
});

// ─── asyncHandler ────────────────────────────────────────────────────────────
describe('RB-202 asyncHandler', () => {
  test('passes resolved handler result through normally', async () => {
    const app = makeApp();
    const res = await request(app).get('/async-ok');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('rejection from async handler reaches the error handler', async () => {
    const app = makeApp();
    const res = await request(app).get('/async-fail');
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('ASYNC_FAIL');
  });
});
