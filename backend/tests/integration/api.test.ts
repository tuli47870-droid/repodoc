import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../../src/app.js';
import { FastifyInstance } from 'fastify';

describe('API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Endpoint', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('service', 'repo-doctor-api');
      expect(body).toHaveProperty('database');
      expect(body).toHaveProperty('redis');
      expect(body).toHaveProperty('timestamp');
    });
  });

  describe('Metrics Endpoint', () => {
    it('should return system metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('database');
      expect(body).toHaveProperty('queue');
      expect(body).toHaveProperty('performance');
      expect(body).toHaveProperty('system');
      
      expect(body.database).toHaveProperty('repositories');
      expect(body.database).toHaveProperty('scans');
      expect(body.queue).toHaveProperty('waiting');
      expect(body.queue).toHaveProperty('active');
    });

    it('should return prometheus metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics/prometheus',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.body).toContain('repo_doctor_repositories_total');
      expect(response.body).toContain('repo_doctor_scans_total');
      expect(response.body).toContain('repo_doctor_queue_waiting');
    });
  });

  describe('Repository Endpoints', () => {
    it('should validate repository creation', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/repositories',
        payload: {
          url: 'invalid-url',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code');
    });

    it('should reject non-GitHub URLs', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/repositories',
        payload: {
          url: 'https://gitlab.com/some/repo',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('INVALID_REPOSITORY_URL');
    });

    it('should list repositories with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/repositories?limit=10&offset=0',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('pagination');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toHaveProperty('limit', 10);
      expect(body.pagination).toHaveProperty('offset', 0);
      expect(body.pagination).toHaveProperty('hasMore');
    });

    it('should enforce maximum page size', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/repositories?limit=1000',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.pagination.limit).toBeLessThanOrEqual(100);
    });

    it('should handle repository not found', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/repositories/nonexistent-id',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('REPOSITORY_NOT_FOUND');
    });
  });

  describe('Scan Endpoints', () => {
    it('should validate scan creation', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/scans',
        payload: {
          repositoryId: '', // Empty ID
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
    });

    it('should reject scan for non-existent repository', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/scans',
        payload: {
          repositoryId: 'nonexistent-repo-id',
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('REPOSITORY_NOT_FOUND');
    });

    it('should list scans with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/scans?limit=10&offset=0',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('pagination');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should filter scans by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/scans?status=COMPLETED',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
    });

    it('should handle scan not found', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/scans/nonexistent-scan-id',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('SCAN_NOT_FOUND');
    });

    it('should get scan progress', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/scans/nonexistent-scan-id/progress',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('SCAN_NOT_FOUND');
    });

    it('should get scan artifacts', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/scans/nonexistent-scan-id/artifacts',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('SCAN_NOT_FOUND');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/unknown-endpoint',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.error.code).toBe('NOT_FOUND');
    });

    it('should include request ID in errors', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/repositories/nonexistent-id',
        headers: {
          'x-request-id': 'test-request-123',
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toHaveProperty('reqId');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      // Helmet should add security headers
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });

    it('should include rate limit headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/repositories',
      });

      // Rate limit headers
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });
});
