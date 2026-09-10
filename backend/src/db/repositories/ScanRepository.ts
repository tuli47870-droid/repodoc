import { PrismaClient, RepositoryScan } from '@prisma/client';
import { ScanStatus, ScanStage } from '../../types/index.js';

export class ScanRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    repositoryId: string;
    branch?: string;
  }): Promise<RepositoryScan> {
    return this.prisma.repositoryScan.create({
      data: {
        repositoryId: data.repositoryId,
        branch: data.branch,
        status: 'QUEUED',
        currentStage: 'QUEUED',
        progress: 0,
      },
    });
  }

  async findById(id: string): Promise<RepositoryScan | null> {
    return this.prisma.repositoryScan.findUnique({
      where: { id },
      include: {
        repository: true,
        artifacts: true,
      },
    });
  }

  async updateStatus(
    id: string,
    status: ScanStatus,
    data?: {
      errorMessage?: string;
      completedAt?: Date;
    }
  ): Promise<RepositoryScan> {
    return this.prisma.repositoryScan.update({
      where: { id },
      data: {
        status,
        ...data,
      },
    });
  }

  async updateProgress(
    id: string,
    progress: {
      stage: ScanStage;
      progress: number;
      message?: string;
    }
  ): Promise<RepositoryScan> {
    return this.prisma.repositoryScan.update({
      where: { id },
      data: {
        currentStage: progress.stage,
        progress: progress.progress,
        progressMessage: progress.message,
      },
    });
  }

  async markRunning(id: string): Promise<RepositoryScan> {
    return this.prisma.repositoryScan.update({
      where: { id },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });
  }

  async complete(
    id: string,
    data: {
      commitSha?: string;
      healthScore?: number | null;
    }
  ): Promise<RepositoryScan> {
    return this.prisma.repositoryScan.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        currentStage: 'READY',
        progress: 100,
        completedAt: new Date(),
        ...data,
      },
    });
  }

  async fail(id: string, errorMessage: string): Promise<RepositoryScan> {
    return this.prisma.repositoryScan.update({
      where: { id },
      data: {
        status: 'FAILED',
        currentStage: 'FAILED',
        errorMessage,
        completedAt: new Date(),
      },
    });
  }

  async listByRepository(
    repositoryId: string,
    options: { skip?: number; take?: number } = {}
  ): Promise<RepositoryScan[]> {
    return this.prisma.repositoryScan.findMany({
      where: { repositoryId },
      skip: options.skip || 0,
      take: options.take || 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(options: {
    where?: any;
    skip?: number;
    take?: number;
  } = {}): Promise<RepositoryScan[]> {
    return this.prisma.repositoryScan.findMany({
      where: options.where,
      skip: options.skip || 0,
      take: options.take || 50,
      orderBy: { createdAt: 'desc' },
      include: {
        repository: {
          select: {
            id: true,
            fullName: true,
            url: true,
          },
        },
      },
    });
  }
}
