import { z } from 'zod';

export const createScanSchema = z.object({
  repositoryId: z.string().min(1, 'Repository ID is required'),
  branch: z.string().optional(),
});

export type CreateScanInput = z.infer<typeof createScanSchema>;
