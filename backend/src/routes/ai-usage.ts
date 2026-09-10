import { FastifyPluginAsync } from 'fastify';
import { aiUsageRepo, scanRepo } from '../db/index.js';

export const aiUsageRoutes: FastifyPluginAsync = async (app) => {
  // Get AI usage for a scan
  app.get('/scans/:scanId/ai-usage', async (request, reply) => {
    const { scanId } = request.params as { scanId: string };

    const scan = await scanRepo.findById(scanId);
    if (!scan) {
      return reply.status(404).send({
        error: {
          code: 'SCAN_NOT_FOUND',
          message: 'Scan not found',
        },
      });
    }

    const usage = await aiUsageRepo.findByScanId(scanId);
    const stats = await aiUsageRepo.getScanStats(scanId);

    return reply.send({
      scanId,
      usage,
      stats,
    });
  });

  // Get global AI usage statistics
  app.get('/ai-usage/stats', async (request, reply) => {
    const query = request.query as {
      startDate?: string;
      endDate?: string;
    };

    const options: any = {};
    if (query.startDate) options.startDate = new Date(query.startDate);
    if (query.endDate) options.endDate = new Date(query.endDate);

    const stats = await aiUsageRepo.getGlobalStats(options);

    return reply.send(stats);
  });

  // Get AI usage history
  app.get('/ai-usage', async (request, reply) => {
    const query = request.query as {
      scanId?: string;
      provider?: string;
      limit?: string;
      offset?: string;
    };

    const limit = Math.min(parseInt(query.limit || '50'), 100);
    const offset = parseInt(query.offset || '0');

    const where: any = {};
    if (query.scanId) where.scanId = query.scanId;
    if (query.provider) where.provider = query.provider;

    const usage = await aiUsageRepo.list({
      where,
      take: limit,
      skip: offset,
    });

    return reply.send({
      data: usage,
      pagination: {
        limit,
        offset,
        hasMore: usage.length === limit,
      },
    });
  });
};
