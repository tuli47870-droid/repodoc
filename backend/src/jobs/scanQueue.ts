import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { config } from '../config/index.js';

// Create Redis connection for BullMQ
const connection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

// Job data interface
export interface ScanJobData {
  scanId: string;
  repositoryId: string;
}

// Create scan queue
export const scanQueue = new Queue<ScanJobData>('repository-scan', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 86400, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // Keep failed jobs for 7 days
    },
  },
});

// Enqueue a scan job
export async function enqueueScanJob(data: ScanJobData): Promise<void> {
  await scanQueue.add('scan-repository', data, {
    jobId: `scan-${data.scanId}`,
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await scanQueue.close();
  await connection.quit();
});
