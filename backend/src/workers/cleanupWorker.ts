/**
 * Cleanup Worker - Handles periodic cleanup tasks
 * 
 * Tasks:
 * 1. Remove expired workspaces
 * 2. Clean up old completed scans (based on retention policy)
 * 3. Clean up orphaned artifacts
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger();
const prisma = new PrismaClient();

interface CleanupConfig {
  completedScanRetentionDays: number;
  failedScanRetentionDays: number;
  workspaceRetentionHours: number;
  runIntervalMinutes: number;
}

const cleanupConfig: CleanupConfig = {
  completedScanRetentionDays: 30, // Keep completed scans for 30 days
  failedScanRetentionDays: 7, // Keep failed scans for 7 days
  workspaceRetentionHours: 24, // Keep workspaces for 24 hours after scan completion
  runIntervalMinutes: 60, // Run cleanup every hour
};

/**
 * Clean up old completed scans
 */
async function cleanupOldScans(): Promise<void> {
  const now = new Date();
  
  // Calculate cutoff dates
  const completedCutoff = new Date(
    now.getTime() - cleanupConfig.completedScanRetentionDays * 24 * 60 * 60 * 1000
  );
  
  const failedCutoff = new Date(
    now.getTime() - cleanupConfig.failedScanRetentionDays * 24 * 60 * 60 * 1000
  );

  try {
    // Delete old completed scans (cascades to artifacts)
    const deletedCompleted = await prisma.repositoryScan.deleteMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          lt: completedCutoff,
        },
      },
    });

    if (deletedCompleted.count > 0) {
      logger.info(
        { count: deletedCompleted.count, cutoff: completedCutoff },
        'Deleted old completed scans'
      );
    }

    // Delete old failed scans
    const deletedFailed = await prisma.repositoryScan.deleteMany({
      where: {
        status: 'FAILED',
        completedAt: {
          lt: failedCutoff,
        },
      },
    });

    if (deletedFailed.count > 0) {
      logger.info(
        { count: deletedFailed.count, cutoff: failedCutoff },
        'Deleted old failed scans'
      );
    }
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup old scans');
  }
}

/**
 * Clean up orphaned workspaces
 */
async function cleanupOrphanedWorkspaces(): Promise<void> {
  try {
    const workspaceRoot = config.repositoryWorkspace;
    
    // Check if workspace directory exists
    try {
      await fs.access(workspaceRoot);
    } catch {
      // Workspace directory doesn't exist, nothing to clean
      return;
    }

    const entries = await fs.readdir(workspaceRoot, { withFileTypes: true });
    
    const now = new Date();
    const cutoff = new Date(
      now.getTime() - cleanupConfig.workspaceRetentionHours * 60 * 60 * 1000
    );

    let cleanedCount = 0;

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const scanId = entry.name;
      const workspacePath = path.join(workspaceRoot, scanId);

      try {
        // Check if scan exists and is completed
        const scan = await prisma.repositoryScan.findUnique({
          where: { id: scanId },
          select: {
            id: true,
            status: true,
            completedAt: true,
          },
        });

        let shouldDelete = false;

        if (!scan) {
          // Orphaned workspace (no scan record)
          shouldDelete = true;
        } else if (scan.status === 'COMPLETED' || scan.status === 'FAILED') {
          // Completed/failed scan, check if past retention period
          if (scan.completedAt && new Date(scan.completedAt) < cutoff) {
            shouldDelete = true;
          }
        }

        if (shouldDelete) {
          await fs.rm(workspacePath, { recursive: true, force: true });
          cleanedCount++;
          logger.info({ scanId, workspacePath }, 'Cleaned up workspace');
        }
      } catch (error) {
        logger.error({ error, scanId, workspacePath }, 'Failed to clean workspace');
      }
    }

    if (cleanedCount > 0) {
      logger.info({ count: cleanedCount }, 'Cleaned up workspaces');
    }
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup workspaces');
  }
}

/**
 * Clean up orphaned artifacts
 */
async function cleanupOrphanedArtifacts(): Promise<void> {
  // Note: Orphaned artifacts are automatically cleaned up by Prisma's CASCADE DELETE
  // This function is kept as a placeholder for future custom cleanup logic
  // When a RepositoryScan is deleted, all associated ScanArtifacts are automatically deleted
  logger.debug('Orphaned artifacts are handled by database CASCADE DELETE');
}

/**
 * Run all cleanup tasks
 */
async function runCleanup(): Promise<void> {
  logger.info('Starting cleanup tasks');
  const start = Date.now();

  await Promise.all([
    cleanupOldScans(),
    cleanupOrphanedWorkspaces(),
    cleanupOrphanedArtifacts(),
  ]);

  const duration = Date.now() - start;
  logger.info({ durationMs: duration }, 'Cleanup tasks completed');
}

/**
 * Main cleanup loop
 */
async function main() {
  logger.info(
    {
      config: cleanupConfig,
    },
    'Cleanup worker started'
  );

  // Run cleanup immediately on start
  await runCleanup();

  // Schedule periodic cleanup
  const intervalMs = cleanupConfig.runIntervalMinutes * 60 * 1000;
  setInterval(async () => {
    try {
      await runCleanup();
    } catch (error) {
      logger.error({ error }, 'Cleanup run failed');
    }
  }, intervalMs);

  logger.info(
    { intervalMinutes: cleanupConfig.runIntervalMinutes },
    'Cleanup worker scheduled'
  );
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down cleanup worker...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down cleanup worker...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the worker
main().catch((error) => {
  logger.error({ error }, 'Cleanup worker crashed');
  process.exit(1);
});
