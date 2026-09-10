import { FastifyPluginAsync } from 'fastify';
import { repositoryRepo } from '../db/index.js';
import { createRepositorySchema, parseGitHubUrl } from '../schemas/repository.js';

export const repositoryRoutes: FastifyPluginAsync = async (app) => {
  // Create or get repository
  app.post('/repositories', async (request, reply) => {
    const validation = createRepositorySchema.safeParse(request.body);
    
    if (!validation.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
    }

    const { url } = validation.data;
    const parsed = parseGitHubUrl(url);

    if (!parsed) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_REPOSITORY_URL',
          message: 'The supplied repository URL is not supported. Only GitHub HTTPS URLs are accepted.',
        },
      });
    }

    try {
      const repository = await repositoryRepo.findOrCreate({
        ...parsed,
        url,
        defaultBranch: 'main',
      });

      return reply.status(repository ? 200 : 201).send(repository);
    } catch (error) {
      request.log.error({ error }, 'Failed to create repository');
      throw error;
    }
  });

  // List repositories with pagination
  app.get('/repositories', async (request, reply) => {
    const query = request.query as {
      limit?: string;
      offset?: string;
      search?: string;
    };

    const limit = Math.min(parseInt(query.limit || '50'), 100); // Max 100 per page
    const offset = parseInt(query.offset || '0');

    const repositories = await repositoryRepo.list({
      take: limit,
      skip: offset,
      ...(query.search && {
        where: {
          OR: [
            { fullName: { contains: query.search, mode: 'insensitive' } },
            { name: { contains: query.search, mode: 'insensitive' } },
            { owner: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      }),
    });

    return reply.send({
      data: repositories,
      pagination: {
        limit,
        offset,
        hasMore: repositories.length === limit,
      },
    });
  });

  // Get repository by ID
  app.get('/repositories/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const repository = await repositoryRepo.findById(id);

    if (!repository) {
      return reply.status(404).send({
        error: {
          code: 'REPOSITORY_NOT_FOUND',
          message: 'Repository not found',
        },
      });
    }

    return reply.send(repository);
  });

  // Get repository scans
  app.get('/repositories/:id/scans', async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as {
      limit?: string;
      offset?: string;
      status?: string;
    };

    const repository = await repositoryRepo.findById(id);
    if (!repository) {
      return reply.status(404).send({
        error: {
          code: 'REPOSITORY_NOT_FOUND',
          message: 'Repository not found',
        },
      });
    }

    const limit = Math.min(parseInt(query.limit || '50'), 100);
    const offset = parseInt(query.offset || '0');

    const { scanRepo } = await import('../db/index.js');
    const filters: any = { repositoryId: id };
    if (query.status) {
      filters.status = query.status;
    }

    const scans = await scanRepo.list({
      where: filters,
      take: limit,
      skip: offset,
    });

    return reply.send({
      repositoryId: id,
      data: scans,
      pagination: {
        limit,
        offset,
        hasMore: scans.length === limit,
      },
    });
  });
};
