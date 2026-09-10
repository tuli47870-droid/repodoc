import { PrismaClient, Diagnosis as PrismaDiagnosis } from '@prisma/client';

export interface CreateDiagnosisInput {
  findingId: string;
  rootCause: string;
  explanation: string;
  impact: string;
  recommendation: string;
  confidence: number;
  aiProvider: string;
  aiModel: string;
  tokensUsed: number;
  costUsd: number;
}

export class DiagnosisRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateDiagnosisInput): Promise<PrismaDiagnosis> {
    return this.prisma.diagnosis.create({
      data,
    });
  }

  async findById(id: string): Promise<PrismaDiagnosis | null> {
    return this.prisma.diagnosis.findUnique({
      where: { id },
      include: {
        finding: true,
      },
    });
  }

  async findByFindingId(findingId: string): Promise<PrismaDiagnosis[]> {
    return this.prisma.diagnosis.findMany({
      where: { findingId },
      orderBy: { confidence: 'desc' },
    });
  }

  async findByScanId(scanId: string): Promise<PrismaDiagnosis[]> {
    return this.prisma.diagnosis.findMany({
      where: {
        finding: {
          scanId,
        },
      },
      include: {
        finding: {
          select: {
            id: true,
            title: true,
            severity: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(options: {
    where?: any;
    skip?: number;
    take?: number;
  } = {}): Promise<PrismaDiagnosis[]> {
    return this.prisma.diagnosis.findMany({
      where: options.where,
      skip: options.skip || 0,
      take: options.take || 50,
      orderBy: { createdAt: 'desc' },
      include: {
        finding: {
          select: {
            id: true,
            title: true,
            severity: true,
            category: true,
            scanId: true,
          },
        },
      },
    });
  }

  async count(where?: any): Promise<number> {
    return this.prisma.diagnosis.count({ where });
  }

  async delete(id: string): Promise<PrismaDiagnosis> {
    return this.prisma.diagnosis.delete({
      where: { id },
    });
  }
}
