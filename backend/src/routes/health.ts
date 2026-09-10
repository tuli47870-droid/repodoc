import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { config } from '../config/index.js';

const prisma = new PrismaClient();

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (request, reply) => {
    const checks = {
      service: 'repo-doctor-api',
      status: 'ok' as 'ok' | 'degraded' | 'error',
      database: 'unknown' as 'ok' | 'error' | 'unknown',
      redis: 'unknown' as 'ok' | 'error' | 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch (error) {
      request.log.error({ error }, 'Database health check failed');
      checks.database = 'error';
      checks.status = 'degraded';
    }

    // Check Redis
    let redis: Redis | null = null;
    try {
      redis = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      });
      await redis.ping();
      checks.redis = 'ok';
    } catch (error) {
      request.log.error({ error }, 'Redis health check failed');
      checks.redis = 'error';
      checks.status = 'degraded';
    } finally {
      if (redis) {
        redis.disconnect();
      }
    }

    const statusCode = checks.status === 'ok' ? 200 : 503;
    return reply.status(statusCode).send(checks);
  });
};
