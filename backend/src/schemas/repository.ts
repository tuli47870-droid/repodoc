import { z } from 'zod';

// GitHub URL validation
const githubUrlRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+?)(\.git)?$/;

export const createRepositorySchema = z.object({
  url: z.string().url().refine(
    (url) => githubUrlRegex.test(url),
    { message: 'Must be a valid GitHub repository URL (https://github.com/owner/repo)' }
  ),
});

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>;

export function parseGitHubUrl(url: string): {
  provider: string;
  owner: string;
  name: string;
  fullName: string;
} | null {
  const match = url.match(githubUrlRegex);
  
  if (!match) {
    return null;
  }

  const [, owner, repoWithExt] = match;
  const name = repoWithExt.replace(/\.git$/, '');
  
  return {
    provider: 'github',
    owner,
    name,
    fullName: `${owner}/${name}`,
  };
}
