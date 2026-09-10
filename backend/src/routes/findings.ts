import { FastifyPluginAsync } from 'fastify';
import { findingRepo, diagnosisRepo, scanRepo } from '../db/index.js';

export const findingRoutes: FastifyPluginAsync = async (app) => {
  // List findings with filtering
  app.get('/findings', async (request, reply) => {
    const query = request.query as {
      scanId?: string;
      category?: string;
      severity?: string;
      limit?: string;
      offset?: string;
    };

    const limit = Math.min(parseInt(query.limit || '50'), 100);
    const offset = parseInt(query.offset || '0');

    const where: any = {};
    if (query.scanId) where.scanId = query.scanId;
    if (query.category) where.category = query.category;
    if (query.severity) where.severity = query.severity;

    const findings = await findingRepo.list({
      where,
      take: limit,
      skip: offset,
    });

    return reply.send({
      data: findings,
      pagination: {
        limit,
        offset,
        hasMore: findings.length === limit,
      },
    });
  });

  // Get finding by ID
  app.get('/findings/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const finding = await findingRepo.findById(id);

    if (!finding) {
      return reply.status(404).send({
        error: {
          code: 'FINDING_NOT_FOUND',
          message: 'Finding not found',
        },
      });
    }

    return reply.send(finding);
  });

  // Get findings for a scan
  app.get('/scans/:scanId/findings', async (request, reply) => {
    const { scanId } = request.params as { scanId: string };
    const query = request.query as {
      category?: string;
      severity?: string;
    };

    // Verify scan exists
    const scan = await scanRepo.findById(scanId);
    if (!scan) {
      return reply.status(404).send({
        error: {
          code: 'SCAN_NOT_FOUND',
          message: 'Scan not found',
        },
      });
    }

    const where: any = { scanId };
    if (query.category) where.category = query.category;
    if (query.severity) where.severity = query.severity;

    const findings = await findingRepo.list({ where });

    // Get counts by category and severity
    const byCategory = await findingRepo.countByCategory(scanId);
    const bySeverity = await findingRepo.countBySeverity(scanId);

    return reply.send({
      scanId,
      findings,
      summary: {
        total: findings.length,
        byCategory,
        bySeverity,
      },
    });
  });

  // Get diagnoses for a finding
  app.get('/findings/:id/diagnoses', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const finding = await findingRepo.findById(id);
    if (!finding) {
      return reply.status(404).send({
        error: {
          code: 'FINDING_NOT_FOUND',
          message: 'Finding not found',
        },
      });
    }

    const diagnoses = await diagnosisRepo.findByFindingId(id);

    return reply.send({
      findingId: id,
      diagnoses,
    });
  });

  // Get all diagnoses for a scan
  app.get('/scans/:scanId/diagnoses', async (request, reply) => {
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

    const diagnoses = await diagnosisRepo.findByScanId(scanId);

    return reply.send({
      scanId,
      diagnoses,
    });
  });

  // Get health score breakdown for a scan
  app.get('/scans/:scanId/health', async (request, reply) => {
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

    const byCategory = await findingRepo.countByCategory(scanId);
    const bySeverity = await findingRepo.countBySeverity(scanId);

    return reply.send({
      scanId,
      healthScore: scan.healthScore,
      breakdown: {
        byCategory,
        bySeverity,
      },
    });
  });
};
