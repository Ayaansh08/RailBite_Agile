const express = require('express');
const request = require('supertest');
const vendorRoutes = require('../../src/vendors/vendorRoutes');

describe('GET /api/vendors', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/vendors', vendorRoutes);
  });

  it('should return 200 with { vendors: [...] } for a known station', async () => {
    const res = await request(app).get('/api/vendors?station=NDLS');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('vendors');
    expect(Array.isArray(res.body.vendors)).toBe(true);
    expect(res.body.vendors.length).toBeGreaterThan(0);

    res.body.vendors.forEach((vendor) => {
      expect(vendor.stationCode).toBe('NDLS');
      expect(vendor).toHaveProperty('id');
      expect(vendor).toHaveProperty('name');
      expect(vendor).toHaveProperty('menu');
      expect(Array.isArray(vendor.menu)).toBe(true);
    });
  });

  it('should be case-insensitive and trim whitespace ("ndls " matches "NDLS")', async () => {
    const resTrimmed = await request(app).get('/api/vendors?station=ndls%20');
    const resExact = await request(app).get('/api/vendors?station=NDLS');

    expect(resTrimmed.status).toBe(200);
    expect(resTrimmed.body.vendors).toEqual(resExact.body.vendors);
  });

  it('should return 200 with { vendors: [] } for unknown station or station with no vendors', async () => {
    const res = await request(app).get('/api/vendors?station=UNKNOWN');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ vendors: [] });
  });

  it('should return 400 with a clear JSON message when station parameter is missing', async () => {
    const res = await request(app).get('/api/vendors');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
    expect(res.body.message.length).toBeGreaterThan(0);
  });

  it('should return 400 when station parameter is empty or whitespace-only', async () => {
    const resEmpty = await request(app).get('/api/vendors?station=');
    expect(resEmpty.status).toBe(400);
    expect(resEmpty.body).toHaveProperty('message');

    const resWhitespace = await request(app).get('/api/vendors?station=%20%20%20');
    expect(resWhitespace.status).toBe(400);
    expect(resWhitespace.body).toHaveProperty('message');
  });

  it('should return vendors sorted stably by name in ascending order', async () => {
    const res = await request(app).get('/api/vendors?station=NDLS');

    expect(res.status).toBe(200);
    const names = res.body.vendors.map((v) => v.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('should never contain credential fields in any vendor or menu item', async () => {
    const res = await request(app).get('/api/vendors?station=NDLS');

    expect(res.status).toBe(200);
    const forbiddenFields = ['password', 'hash', 'token', 'secret', 'username', 'salt'];

    res.body.vendors.forEach((vendor) => {
      forbiddenFields.forEach((field) => {
        expect(vendor).not.toHaveProperty(field);
      });

      vendor.menu.forEach((item) => {
        forbiddenFields.forEach((field) => {
          expect(item).not.toHaveProperty(field);
        });
      });
    });
  });
});
