import { FastifyPluginAsync } from 'fastify';
import { repositoryRepo, scanRepo } from '../db/index.js';
import { createScanSchema } from '../schemas/scan.js';
import { enqueueScanJob } from '../jobs/scanQueue.js';

export const scanRoutes: FastifyPluginAsync = async (app) => {
  // Stricter rate limit for scan creation (expensive operation)
  const scanRateLimitConfig = {
    max: 5, // 5 scans
    timeWindow: '1 minute',
  };

  // Create scan
  app.post('/scans', {
    config: {
      rateLimit: scanRateLimitConfig,
    },
  }, async (request, reply) => {
    const validation = createScanSchema.safeParse(request.body);
    
    if (!validation.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
    }

    const { repositoryId, branch } = validation.data;

    // Verify repository exists
    const repository = await repositoryRepo.findById(repositoryId);
    if (!repository) {
      return reply.status(404).send({
        error: {
          code: 'REPOSITORY_NOT_FOUND',
          message: 'Repository not found',
        },
      });
    }

    try {
      // Create scan record
      const scan = await scanRepo.create({
        repositoryId,
        branch: branch || repository.defaultBranch || 'main',
      });

      // Enqueue background job
      await enqueueScanJob({
        scanId: scan.id,
        repositoryId: scan.repositoryId,
      });

      request.log.info({ scanId: scan.id }, 'Scan created and enqueued');

      return reply.status(201).send(scan);
    } catch (error) {
      request.log.error({ error }, 'Failed to create scan');
      throw error;
    }
  });

  // List scans with pagination
  app.get('/scans', async (request, reply) => {
    const query = request.query as {
      repositoryId?: string;
      status?: string;
      limit?: string;
      offset?: string;
    };

    const limit = Math.min(parseInt(query.limit || '50'), 100); // Max 100 per page
    const offset = parseInt(query.offset || '0');

    const filters: any = {};
    if (query.repositoryId) {
      filters.repositoryId = query.repositoryId;
    }
    if (query.status) {
      filters.status = query.status;
    }

    const scans = await scanRepo.list({
      where: filters,
      take: limit,
      skip: offset,
    });

    return reply.send({
      data: scans,
      pagination: {
        limit,
        offset,
        hasMore: scans.length === limit,
      },
    });
  });

  // Get scan by ID
  app.get('/scans/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const scan = await scanRepo.findById(id);

    if (!scan) {
      return reply.status(404).send({
        error: {
          code: 'SCAN_NOT_FOUND',
          message: 'Scan not found',
        },
      });
    }

    return reply.send(scan);
  });

  // Get scan progress
  app.get('/scans/:id/progress', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const scan = await scanRepo.findById(id);

    if (!scan) {
      return reply.status(404).send({
        error: {
          code: 'SCAN_NOT_FOUND',
          message: 'Scan not found',
        },
      });
    }

    return reply.send({
      scanId: scan.id,
      status: scan.status,
      stage: scan.currentStage,
      progress: scan.progress,
      message: scan.progressMessage,
      startedAt: scan.startedAt,
      completedAt: scan.completedAt,
      errorMessage: scan.errorMessage,
    });
  });

  // Get scan artifacts
  app.get('/scans/:id/artifacts', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const scan = await scanRepo.findById(id);
    if (!scan) {
      return reply.status(404).send({
        error: {
          code: 'SCAN_NOT_FOUND',
          message: 'Scan not found',
        },
      });
    }

    const { artifactRepo } = await import('../db/index.js');
    const artifacts = await artifactRepo.findByScanId(id);

    return reply.send({
      scanId: id,
      artifacts,
    });
  });
};
