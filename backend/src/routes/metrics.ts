import { FastifyPluginAsync } from 'fastify';
import { scanQueue } from '../jobs/scanQueue.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metricsRoutes: FastifyPluginAsync = async (app) => {
  // System metrics endpoint
  app.get('/metrics', async (request, reply) => {
    try {
      // Database metrics
      const [
        totalRepositories,
        totalScans,
        runningScans,
        completedScans,
        failedScans,
        totalFindings,
        totalDiagnoses,
      ] = await Promise.all([
        prisma.repository.count(),
        prisma.repositoryScan.count(),
        prisma.repositoryScan.count({ where: { status: 'RUNNING' } }),
        prisma.repositoryScan.count({ where: { status: 'COMPLETED' } }),
        prisma.repositoryScan.count({ where: { status: 'FAILED' } }),
        prisma.finding.count(),
        prisma.diagnosis.count(),
      ]);

      // Queue metrics
      const queueMetrics = await scanQueue.getJobCounts();

      // Recent scan stats
      const recentScans = await prisma.repositoryScan.findMany({
        where: {
          completedAt: {
            not: null,
          },
        },
        select: {
          startedAt: true,
          completedAt: true,
        },
        orderBy: {
          completedAt: 'desc',
        },
        take: 100,
      });

      const scanDurations = recentScans
        .filter((scan): scan is { startedAt: Date; completedAt: Date } => 
          scan.startedAt !== null && scan.completedAt !== null
        )
        .map((scan) => {
          const start = new Date(scan.startedAt).getTime();
          const end = new Date(scan.completedAt).getTime();
          return (end - start) / 1000; // seconds
        });

      const avgScanDuration = scanDurations.length > 0
        ? scanDurations.reduce((a: number, b: number) => a + b, 0) / scanDurations.length
        : 0;

      const metrics = {
        timestamp: new Date().toISOString(),
        database: {
          repositories: totalRepositories,
          scans: {
            total: totalScans,
            running: runningScans,
            completed: completedScans,
            failed: failedScans,
          },
          findings: totalFindings,
          diagnoses: totalDiagnoses,
        },
        queue: {
          waiting: queueMetrics.waiting || 0,
          active: queueMetrics.active || 0,
          completed: queueMetrics.completed || 0,
          failed: queueMetrics.failed || 0,
          delayed: queueMetrics.delayed || 0,
        },
        performance: {
          avgScanDurationSeconds: Math.round(avgScanDuration * 100) / 100,
          recentScansAnalyzed: scanDurations.length,
        },
        system: {
          uptime: process.uptime(),
          memory: {
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024), // MB
          },
        },
      };

      return reply.send(metrics);
    } catch (error) {
      request.log.error({ error }, 'Failed to fetch metrics');
      throw error;
    }
  });

  // Prometheus-compatible metrics (basic)
  app.get('/metrics/prometheus', async (request, reply) => {
    try {
      const [
        totalRepositories,
        totalScans,
        runningScans,
        completedScans,
        failedScans,
        totalFindings,
        totalDiagnoses,
      ] = await Promise.all([
        prisma.repository.count(),
        prisma.repositoryScan.count(),
        prisma.repositoryScan.count({ where: { status: 'RUNNING' } }),
        prisma.repositoryScan.count({ where: { status: 'COMPLETED' } }),
        prisma.repositoryScan.count({ where: { status: 'FAILED' } }),
        prisma.finding.count(),
        prisma.diagnosis.count(),
      ]);

      const queueMetrics = await scanQueue.getJobCounts();

      const metrics = `
# HELP repo_doctor_repositories_total Total number of repositories
# TYPE repo_doctor_repositories_total counter
repo_doctor_repositories_total ${totalRepositories}

# HELP repo_doctor_scans_total Total number of scans
# TYPE repo_doctor_scans_total counter
repo_doctor_scans_total ${totalScans}

# HELP repo_doctor_scans_running Number of running scans
# TYPE repo_doctor_scans_running gauge
repo_doctor_scans_running ${runningScans}

# HELP repo_doctor_scans_completed Number of completed scans
# TYPE repo_doctor_scans_completed counter
repo_doctor_scans_completed ${completedScans}

# HELP repo_doctor_scans_failed Number of failed scans
# TYPE repo_doctor_scans_failed counter
repo_doctor_scans_failed ${failedScans}

# HELP repo_doctor_queue_waiting Jobs waiting in queue
# TYPE repo_doctor_queue_waiting gauge
repo_doctor_queue_waiting ${queueMetrics.waiting || 0}

# HELP repo_doctor_queue_active Active jobs in queue
# TYPE repo_doctor_queue_active gauge
repo_doctor_queue_active ${queueMetrics.active || 0}

# HELP repo_doctor_process_uptime_seconds Process uptime in seconds
# TYPE repo_doctor_process_uptime_seconds gauge
repo_doctor_process_uptime_seconds ${Math.round(process.uptime())}

# HELP repo_doctor_memory_heap_used_bytes Heap memory used in bytes
# TYPE repo_doctor_memory_heap_used_bytes gauge
repo_doctor_memory_heap_used_bytes ${process.memoryUsage().heapUsed}

# HELP repo_doctor_findings_total Total number of findings
# TYPE repo_doctor_findings_total counter
repo_doctor_findings_total ${totalFindings}

# HELP repo_doctor_diagnoses_total Total number of AI diagnoses
# TYPE repo_doctor_diagnoses_total counter
repo_doctor_diagnoses_total ${totalDiagnoses}
`;

      return reply
        .header('Content-Type', 'text/plain; version=0.0.4')
        .send(metrics.trim());
    } catch (error) {
      request.log.error({ error }, 'Failed to generate Prometheus metrics');
      throw error;
    }
  });
};
