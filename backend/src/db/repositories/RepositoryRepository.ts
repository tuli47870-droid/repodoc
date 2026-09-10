import { PrismaClient, Repository } from '@prisma/client';

export class RepositoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    provider: string;
    owner: string;
    name: string;
    fullName: string;
    url: string;
    defaultBranch?: string;
  }): Promise<Repository> {
    return this.prisma.repository.create({
      data,
    });
  }

  async findById(id: string): Promise<Repository | null> {
    return this.prisma.repository.findUnique({
      where: { id },
    });
  }

  async findByProviderAndFullName(
    _provider: string,
    fullName: string
  ): Promise<Repository | null> {
    return this.prisma.repository.findUnique({
      where: { fullName },
    });
  }

  async findOrCreate(data: {
    provider: string;
    owner: string;
    name: string;
    fullName: string;
    url: string;
    defaultBranch?: string;
  }): Promise<Repository> {
    const existing = await this.findByProviderAndFullName(data.provider, data.fullName);
    
    if (existing) {
      return existing;
    }

    return this.create(data);
  }

  async list(options: {
    where?: any;
    skip?: number;
    take?: number;
  } = {}): Promise<Repository[]> {
    return this.prisma.repository.findMany({
      where: options.where,
      skip: options.skip || 0,
      take: options.take || 50,
      orderBy: { createdAt: 'desc' },
    });
  }
}
