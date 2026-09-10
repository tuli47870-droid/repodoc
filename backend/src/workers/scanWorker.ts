import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { config } from '../config/index.js';
import { ScanJobData } from '../jobs/scanQueue.js';
import { scanRepo, repositoryRepo, findingRepo, diagnosisRepo, aiUsageRepo } from '../db/index.js';
import { RepositoryIntakeService } from '../services/RepositoryIntakeService.js';
import { RepositoryMapperService } from '../services/RepositoryMapperService.js';
import { AIAnalysisService } from '../services/AIAnalysisService.js';
import { createLogger } from '../utils/logger.js';
import { registerBuiltInScanners, ScannerExecutor } from '../scanners/index.js';

const logger = createLogger();

// Register scanners on startup
registerBuiltInScanners();
logger.info('Built-in scanners registered');

// Create Redis connection for worker
const connection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

const repositoryIntake = new RepositoryIntakeService();
const repositoryMapper = new RepositoryMapperService();

// Initialize AI analysis service if enabled
let aiAnalysisService: AIAnalysisService | null = null;
if (config.aiEnabled) {
  aiAnalysisService = new AIAnalysisService(
    diagnosisRepo,
    aiUsageRepo
  );
  logger.info('AI analysis service initialized');
}

/**
 * Calculate health score from findings
 * Simple algorithm: Start at 100, subtract points for each finding based on severity
 */
function calculateHealthScore(findings: any[]): number {
  if (!config.healthScoreEnabled) {
    return 100; // Default to perfect if disabled
  }

  let score = 100;
  
  // Severity weights
  const weights: Record<string, number> = {
    CRITICAL: 20,
    HIGH: 10,
    MEDIUM: 5,
    LOW: 2,
    INFO: 0,
  };

  for (const finding of findings) {
    const weight = weights[finding.severity] || 0;
    score -= weight * finding.confidence; // Adjust by confidence
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

async function processScanJob(job: Job<ScanJobData>) {
  const { scanId, repositoryId } = job.data;
  
  logger.info({ scanId, repositoryId }, 'Processing scan job');

  try {
    // Mark scan as running
    await scanRepo.markRunning(scanId);
    
    // Get repository details
    const repository = await repositoryRepo.findById(repositoryId);
    if (!repository) {
      throw new Error(`Repository ${repositoryId} not found`);
    }

    const scan = await scanRepo.findById(scanId);
    if (!scan) {
      throw new Error(`Scan ${scanId} not found`);
    }

    // Update progress: Cloning
    await scanRepo.updateProgress(scanId, {
      stage: 'CLONING',
      progress: 10,
      message: 'Cloning repository...',
    });

    // Clone repository
    const workspace = await repositoryIntake.cloneRepository({
      url: repository.url,
      branch: scan.branch || repository.defaultBranch || 'main',
      scanId,
    });

    logger.info({ scanId, workspace: workspace.path }, 'Repository cloned');

    // Update progress: Mapping
    await scanRepo.updateProgress(scanId, {
      stage: 'MAPPING',
      progress: 50,
      message: 'Analyzing repository structure...',
    });

    // Generate repository manifest
    const manifest = await repositoryMapper.generateManifest({
      workspace: workspace.path,
      repository: {
        provider: repository.provider,
        owner: repository.owner,
        name: repository.name,
        fullName: repository.fullName,
        url: repository.url,
      },
      commit: workspace.commitSha,
      branch: scan.branch || repository.defaultBranch || 'main',
    });

    logger.info(
      {
        scanId,
        fileCount: manifest.fileCount,
        languages: manifest.languages,
      },
      'Repository manifest generated'
    );

    // Store manifest as artifact
    const { artifactRepo } = await import('../db/index.js');
    await artifactRepo.create({
      scanId,
      type: 'REPOSITORY_MANIFEST',
      metadata: manifest,
    });

    // Update progress: Scanning
    await scanRepo.updateProgress(scanId, {
      stage: 'MAPPING',
      progress: 70,
      message: 'Running security and quality scanners...',
    });

    // Run scanners
    logger.info({ scanId }, 'Starting scanners');
    const scanContext = {
      scanId,
      workspacePath: workspace.path,
      manifest,
      repository: {
        provider: repository.provider,
        owner: repository.owner,
        name: repository.name,
        fullName: repository.fullName,
        url: repository.url,
      },
      commitSha: workspace.commitSha,
      branch: scan.branch || repository.defaultBranch || 'main',
    };

    const scannerExecutions = await ScannerExecutor.executeAll(scanContext);
    
    // Collect all findings
    const allFindings = scannerExecutions.flatMap(e => e.findings);
    logger.info({ scanId, findingCount: allFindings.length }, 'Scanners completed');

    // Store findings in database
    if (allFindings.length > 0) {
      const createdCount = await findingRepo.createMany(
        allFindings.map(finding => ({
          scanId,
          category: finding.category,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          location: finding.location || null,
          evidence: finding.evidence || null,
          confidence: finding.confidence,
          fingerprint: finding.fingerprint,
          scanner: finding.scanner,
          metadata: finding.metadata || null,
        }))
      );
      logger.info({ scanId, stored: createdCount }, 'Findings stored');

      // Run AI analysis if enabled
      if (aiAnalysisService && config.aiEnabled) {
        await scanRepo.updateProgress(scanId, {
          stage: 'MAPPING',
          progress: 85,
          message: 'Analyzing findings with AI...',
        });

        logger.info({ scanId, findingCount: allFindings.length }, 'Starting AI analysis');

        try {
          // Fetch the created findings from database to get their IDs
          const createdFindings = await findingRepo.findByScanId(scanId);
          
          // Prepare diagnosis requests for high-priority findings
          const diagnosisRequests = createdFindings
            .filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH')
            .map(finding => ({
              finding,
              repositoryContext: {
                name: repository.fullName,
                language: manifest.languages[0] || undefined,
                framework: manifest.frameworks[0] || undefined,
              },
              // TODO: Add code context extraction here
            }));

          if (diagnosisRequests.length > 0) {
            const results = await aiAnalysisService.diagnoseBatch(diagnosisRequests);
            logger.info(
              {
                scanId,
                diagnosedCount: results.length,
                totalTokens: results.reduce((sum, r) => sum + r.tokensUsed, 0),
                totalCost: results.reduce((sum, r) => sum + r.cost, 0),
              },
              'AI analysis completed'
            );
          }
        } catch (aiError) {
          logger.error(
            { error: aiError, scanId },
            'AI analysis failed, continuing without diagnoses'
          );
          // Don't fail the scan if AI analysis fails
        }
      }
    }

    // Calculate basic health score (simple algorithm for now)
    const healthScore = calculateHealthScore(allFindings);

    // Complete scan
    await scanRepo.complete(scanId, {
      commitSha: workspace.commitSha,
      healthScore,
    });

    // Cleanup workspace
    await repositoryIntake.cleanupWorkspace(workspace.path);

    logger.info({ scanId }, 'Scan completed successfully');
  } catch (error) {
    logger.error({ error, scanId }, 'Scan job failed');

    // Mark scan as failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await scanRepo.fail(scanId, errorMessage);

    // Cleanup workspace if it exists
    try {
      await repositoryIntake.cleanupWorkspace(`${config.repositoryWorkspace}/${scanId}`);
    } catch (cleanupError) {
      logger.error({ error: cleanupError }, 'Failed to cleanup workspace');
    }

    throw error;
  }
}

// Create worker
const worker = new Worker<ScanJobData>('repository-scan', processScanJob, {
  connection,
  concurrency: 2, // Process up to 2 scans concurrently
  limiter: {
    max: 10, // Max 10 jobs
    duration: 60000, // per minute
  },
});

// Worker event handlers
worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Job failed');
});

worker.on('error', (err) => {
  logger.error({ error: err }, 'Worker error');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker...');
  await worker.close();
  await connection.quit();
  process.exit(0);
});

logger.info('Scan worker started');
