import { PrismaClient, AIUsage as PrismaAIUsage } from '@prisma/client';

export interface CreateAIUsageInput {
  scanId: string;
  provider: string;
  model: string;
  task: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
}

export class AIUsageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAIUsageInput): Promise<PrismaAIUsage> {
    return this.prisma.aIUsage.create({
      data,
    });
  }

  async findById(id: string): Promise<PrismaAIUsage | null> {
    return this.prisma.aIUsage.findUnique({
      where: { id },
    });
  }

  async findByScanId(scanId: string): Promise<PrismaAIUsage[]> {
    return this.prisma.aIUsage.findMany({
      where: { scanId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(options: {
    where?: any;
    skip?: number;
    take?: number;
  } = {}): Promise<PrismaAIUsage[]> {
    return this.prisma.aIUsage.findMany({
      where: options.where,
      skip: options.skip || 0,
      take: options.take || 100,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getScanStats(scanId: string): Promise<{
    totalCost: number;
    totalTokens: number;
    byProvider: Record<string, { cost: number; tokens: number; calls: number }>;
  }> {
    const usage = await this.findByScanId(scanId);

    let totalCost = 0;
    let totalTokens = 0;
    const byProvider: Record<string, { cost: number; tokens: number; calls: number }> = {};

    for (const record of usage) {
      totalCost += record.costUsd;
      totalTokens += record.totalTokens;

      if (!byProvider[record.provider]) {
        byProvider[record.provider] = { cost: 0, tokens: 0, calls: 0 };
      }

      byProvider[record.provider].cost += record.costUsd;
      byProvider[record.provider].tokens += record.totalTokens;
      byProvider[record.provider].calls++;
    }

    return {
      totalCost,
      totalTokens,
      byProvider,
    };
  }

  async getGlobalStats(options: {
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{
    totalCost: number;
    totalTokens: number;
    totalCalls: number;
    byProvider: Record<string, { cost: number; tokens: number; calls: number }>;
    byModel: Record<string, { cost: number; tokens: number; calls: number }>;
  }> {
    const where: any = {};
    
    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    const usage = await this.list({ where });

    let totalCost = 0;
    let totalTokens = 0;
    const byProvider: Record<string, { cost: number; tokens: number; calls: number }> = {};
    const byModel: Record<string, { cost: number; tokens: number; calls: number }> = {};

    for (const record of usage) {
      totalCost += record.costUsd;
      totalTokens += record.totalTokens;

      // By provider
      if (!byProvider[record.provider]) {
        byProvider[record.provider] = { cost: 0, tokens: 0, calls: 0 };
      }
      byProvider[record.provider].cost += record.costUsd;
      byProvider[record.provider].tokens += record.totalTokens;
      byProvider[record.provider].calls++;

      // By model
      if (!byModel[record.model]) {
        byModel[record.model] = { cost: 0, tokens: 0, calls: 0 };
      }
      byModel[record.model].cost += record.costUsd;
      byModel[record.model].tokens += record.totalTokens;
      byModel[record.model].calls++;
    }

    return {
      totalCost,
      totalTokens,
      totalCalls: usage.length,
      byProvider,
      byModel,
    };
  }

  async count(where?: any): Promise<number> {
    return this.prisma.aIUsage.count({ where });
  }

  async delete(id: string): Promise<PrismaAIUsage> {
    return this.prisma.aIUsage.delete({
      where: { id },
    });
  }
}
