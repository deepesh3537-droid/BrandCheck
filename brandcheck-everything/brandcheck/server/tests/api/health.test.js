import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('GET /api/health', () => {
  it('returns status ok with timestamp and service name', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'brandcheck-server');
    expect(res.body).toHaveProperty('timestamp');
  });
});
