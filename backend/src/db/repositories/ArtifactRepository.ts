import { PrismaClient, ScanArtifact } from '@prisma/client';
import { ArtifactType } from '../../types/index.js';

export class ArtifactRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    scanId: string;
    type: ArtifactType;
    path?: string;
    metadata: any;
  }): Promise<ScanArtifact> {
    return this.prisma.scanArtifact.create({
      data,
    });
  }

  async findById(id: string): Promise<ScanArtifact | null> {
    return this.prisma.scanArtifact.findUnique({
      where: { id },
    });
  }

  async findByScan(scanId: string): Promise<ScanArtifact[]> {
    return this.prisma.scanArtifact.findMany({
      where: { scanId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByScanId(scanId: string): Promise<ScanArtifact[]> {
    return this.findByScan(scanId);
  }

  async findByScanAndType(
    scanId: string,
    type: ArtifactType
  ): Promise<ScanArtifact | null> {
    return this.prisma.scanArtifact.findFirst({
      where: { scanId, type },
      orderBy: { createdAt: 'desc' },
    });
  }
}
