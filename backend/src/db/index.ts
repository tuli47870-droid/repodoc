import { PrismaClient } from '@prisma/client';
import { RepositoryRepository } from './repositories/RepositoryRepository.js';
import { ScanRepository } from './repositories/ScanRepository.js';
import { ArtifactRepository } from './repositories/ArtifactRepository.js';
import { FindingRepository } from './repositories/FindingRepository.js';
import { DiagnosisRepository } from './repositories/DiagnosisRepository.js';
import { AIUsageRepository } from './repositories/AIUsageRepository.js';

// Singleton Prisma client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Repository instances
export const repositoryRepo = new RepositoryRepository(prisma);
export const scanRepo = new ScanRepository(prisma);
export const artifactRepo = new ArtifactRepository(prisma);
export const findingRepo = new FindingRepository(prisma);
export const diagnosisRepo = new DiagnosisRepository(prisma);
export const aiUsageRepo = new AIUsageRepository(prisma);

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
