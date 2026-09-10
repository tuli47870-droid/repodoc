import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/index.js';
import { createLogger } from './utils/logger.js';
import { healthRoutes } from './routes/health.js';
import { repositoryRoutes } from './routes/repositories.js';
import { scanRoutes } from './routes/scans.js';

const logger = createLogger();

export async function createApp() {
  const app = Fastify({
    logger,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    trustProxy: true, // Important for rate limiting behind proxy
  });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Allow frontend to work
    crossOriginEmbedderPolicy: false,
  });

  // Register CORS
  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  // Global rate limiting
  await app.register(rateLimit, {
    max: 100, // 100 requests
    timeWindow: '1 minute',
    cache: 10000, // Cache 10k unique IPs
    allowList: ['127.0.0.1'], // Whitelist localhost
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
  });

  // Request logging hook
  app.addHook('onRequest', async (request) => {
    request.log.info({
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    }, 'Incoming request');
  });

  // Response time tracking
  app.addHook('onResponse', async (request, reply) => {
    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    }, 'Request completed');
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error({
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      reqId: request.id,
    }, 'Request error');
    
    // Don't expose internal errors in production
    const isDevelopment = config.nodeEnv === 'development';
    
    // Handle rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
      });
    }

    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: isDevelopment ? error.validation : undefined,
        },
      });
    }
    
    reply.status(error.statusCode || 500).send({
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: isDevelopment ? error.message : 'An internal error occurred',
        reqId: request.id,
        ...(isDevelopment && { stack: error.stack }),
      },
    });
  });

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
        path: request.url,
      },
    });
  });

  // Register routes
  await app.register(healthRoutes);
  await app.register(repositoryRoutes, { prefix: '/api' });
  await app.register(scanRoutes, { prefix: '/api' });
  
  // Phase 2 routes
  const { findingRoutes } = await import('./routes/findings.js');
  await app.register(findingRoutes, { prefix: '/api' });
  
  const { aiUsageRoutes } = await import('./routes/ai-usage.js');
  await app.register(aiUsageRoutes, { prefix: '/api' });
  
  // Metrics route (no /api prefix for operational endpoints)
  const { metricsRoutes } = await import('./routes/metrics.js');
  await app.register(metricsRoutes);

  return app;
}
