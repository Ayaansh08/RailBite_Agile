/**
 * RB-201: Express MVC skeleton — RED tests
 * Tests for createApp, loadConfig, buildMounts, health, CORS, body limit, helmet, 404.
 */
'use strict';

const request = require('supertest');

// ─── loadConfig ──────────────────────────────────────────────────────────────
describe('RB-201 loadConfig', () => {
  let loadConfig;

  beforeEach(() => {
    jest.resetModules();
    loadConfig = require('../../src/config/env').loadConfig;
  });

  test('returns defaults when env vars are absent', () => {
    const cfg = loadConfig({});
    expect(cfg.port).toBe(5000);
    expect(cfg.corsOrigin).toBe('http://localhost:5173');
    expect(cfg.jwtExpiresIn).toBe('8h');
    expect(cfg.nodeEnv).toBe('development');
    // jwtSecret should be a non-empty dev default string, not throw
    expect(typeof cfg.jwtSecret).toBe('string');
    expect(cfg.jwtSecret.length).toBeGreaterThan(0);
  });

  test('reads PORT, CORS_ORIGIN, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV from env', () => {
    const cfg = loadConfig({
      PORT: '4321',
      CORS_ORIGIN: 'https://example.com',
      JWT_SECRET: 'supersecret',
      JWT_EXPIRES_IN: '2h',
      NODE_ENV: 'test',
    });
    expect(cfg.port).toBe(4321);
    expect(cfg.corsOrigin).toBe('https://example.com');
    expect(cfg.jwtSecret).toBe('supersecret');
    expect(cfg.jwtExpiresIn).toBe('2h');
    expect(cfg.nodeEnv).toBe('test');
  });

  test('throws in production when jwtSecret is missing', () => {
    expect(() =>
      loadConfig({ NODE_ENV: 'production' })
    ).toThrow();
  });

  test('throws in production when jwtSecret is "change-me"', () => {
    expect(() =>
      loadConfig({ NODE_ENV: 'production', JWT_SECRET: 'change-me' })
    ).toThrow();
  });

  test('does NOT throw in development when jwtSecret is missing', () => {
    expect(() =>
      loadConfig({ NODE_ENV: 'development' })
    ).not.toThrow();
  });

  test('does NOT throw in test when jwtSecret is missing', () => {
    expect(() =>
      loadConfig({ NODE_ENV: 'test' })
    ).not.toThrow();
  });
});

// ─── createApp ───────────────────────────────────────────────────────────────
describe('RB-201 createApp', () => {
  let createApp;
  const express = require('express');

  beforeEach(() => {
    jest.resetModules();
    createApp = require('../../src/app').createApp;
  });

  test('GET /api/health returns 200 { status: "ok" }', async () => {
    const app = createApp({});
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('unknown route returns 404 with { message, code: "NOT_FOUND" }', async () => {
    const app = createApp({});
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
    expect(typeof res.body.message).toBe('string');
  });

  test('mounts routers at specified paths', async () => {
    const router = express.Router();
    router.get('/ping', (_req, res) => res.json({ pong: true }));
    const app = createApp({ mounts: [{ path: '/api/test', router }] });
    const res = await request(app).get('/api/test/ping');
    expect(res.status).toBe(200);
    expect(res.body.pong).toBe(true);
  });

  test('CORS allows the configured origin', async () => {
    const app = createApp({ corsOrigin: 'https://allowed.example.com' });
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://allowed.example.com');
    expect(res.headers['access-control-allow-origin']).toBe('https://allowed.example.com');
  });

  test('CORS blocks a different origin (no ACAO header)', async () => {
    const app = createApp({ corsOrigin: 'https://allowed.example.com' });
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://evil.example.com');
    // cors either omits the header or sets it differently for blocked origins
    expect(res.headers['access-control-allow-origin']).not.toBe('https://evil.example.com');
  });

  test('JSON body over 100kb is rejected with 413', async () => {
    const app = createApp({});
    const bigBody = JSON.stringify({ data: 'x'.repeat(102 * 1024) });
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send(bigBody);
    expect(res.status).toBe(413);
  });

  test('helmet header (x-dns-prefetch-control) is present', async () => {
    const app = createApp({});
    const res = await request(app).get('/api/health');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
  });
});

// ─── buildMounts ─────────────────────────────────────────────────────────────
describe('RB-201 buildMounts', () => {
  test('returns an array of { path, router } objects', () => {
    const { buildMounts } = require('../../src/routes/index');
    const mounts = buildMounts({});
    expect(Array.isArray(mounts)).toBe(true);
    mounts.forEach((m) => {
      expect(typeof m.path).toBe('string');
      expect(m.path.startsWith('/')).toBe(true);
      expect(typeof m.router).toBe('function'); // Express router is a function
    });
  });

  test('includes /api/journey mount', () => {
    const { buildMounts } = require('../../src/routes/index');
    const mounts = buildMounts({});
    expect(mounts.some((m) => m.path === '/api/journey')).toBe(true);
  });

  test('includes /api/vendors mount', () => {
    const { buildMounts } = require('../../src/routes/index');
    const mounts = buildMounts({});
    expect(mounts.some((m) => m.path === '/api/vendors')).toBe(true);
  });
});
