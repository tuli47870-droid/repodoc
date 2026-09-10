import { PrismaClient, Finding as PrismaFinding } from '@prisma/client';

export interface CreateFindingInput {
  scanId: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  location?: any;
  evidence?: any;
  confidence: number;
  fingerprint: string;
  scanner: string;
  metadata?: any;
}

export class FindingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateFindingInput): Promise<PrismaFinding> {
    return this.prisma.finding.create({
      data,
    });
  }

  async createMany(data: CreateFindingInput[]): Promise<number> {
    const result = await this.prisma.finding.createMany({
      data,
      skipDuplicates: true, // Skip if fingerprint already exists
    });
    return result.count;
  }

  async findById(id: string): Promise<PrismaFinding | null> {
    return this.prisma.finding.findUnique({
      where: { id },
      include: {
        diagnoses: true,
      },
    });
  }

  async findByScanId(scanId: string): Promise<PrismaFinding[]> {
    return this.prisma.finding.findMany({
      where: { scanId },
      orderBy: [
        { severity: 'asc' }, // CRITICAL first
        { createdAt: 'desc' },
      ],
    });
  }

  async findByFingerprint(fingerprint: string): Promise<PrismaFinding | null> {
    return this.prisma.finding.findFirst({
      where: { fingerprint },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(options: {
    where?: any;
    skip?: number;
    take?: number;
    orderBy?: any;
  } = {}): Promise<PrismaFinding[]> {
    return this.prisma.finding.findMany({
      where: options.where,
      skip: options.skip || 0,
      take: options.take || 50,
      orderBy: options.orderBy || { createdAt: 'desc' },
      include: {
        scan: {
          select: {
            id: true,
            repository: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });
  }

  async count(where?: any): Promise<number> {
    return this.prisma.finding.count({ where });
  }

  async countByCategory(scanId: string): Promise<Record<string, number>> {
    const results = await this.prisma.finding.groupBy({
      by: ['category'],
      where: { scanId },
      _count: true,
    });

    const counts: Record<string, number> = {};
    for (const result of results) {
      counts[result.category] = result._count;
    }

    return counts;
  }

  async countBySeverity(scanId: string): Promise<Record<string, number>> {
    const results = await this.prisma.finding.groupBy({
      by: ['severity'],
      where: { scanId },
      _count: true,
    });

    const counts: Record<string, number> = {};
    for (const result of results) {
      counts[result.severity] = result._count;
    }

    return counts;
  }

  async delete(id: string): Promise<PrismaFinding> {
    return this.prisma.finding.delete({
      where: { id },
    });
  }

  async deleteByScanId(scanId: string): Promise<number> {
    const result = await this.prisma.finding.deleteMany({
      where: { scanId },
    });
    return result.count;
  }
}
