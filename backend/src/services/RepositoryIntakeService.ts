import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config/index.js';

export interface CloneOptions {
  url: string;
  branch: string;
  scanId: string;
}

export interface WorkspaceInfo {
  path: string;
  commitSha: string;
  branch: string;
}

export class RepositoryIntakeService {
  /**
   * Clone a public GitHub repository into an isolated workspace
   * SECURITY: Only clones public repositories, never executes repository code
   */
  async cloneRepository(options: CloneOptions): Promise<WorkspaceInfo> {
    const { url, branch, scanId } = options;

    // Validate URL format (already validated in API, but double-check)
    if (!url.startsWith('https://github.com/')) {
      throw new Error('Only GitHub HTTPS URLs are supported');
    }

    // Create isolated workspace directory
    const workspacePath = path.join(config.repositoryWorkspace, scanId);
    
    try {
      // Ensure parent directory exists
      await fs.mkdir(config.repositoryWorkspace, { recursive: true });

      // Remove existing workspace if it exists
      try {
        await fs.rm(workspacePath, { recursive: true, force: true });
      } catch (error) {
        // Ignore if doesn't exist
      }

      // Create workspace directory
      await fs.mkdir(workspacePath, { recursive: true });

      // Clone repository with safety options
      const git: SimpleGit = simpleGit({
        baseDir: workspacePath,
        binary: 'git',
        maxConcurrentProcesses: 1,
        trimmed: false,
        timeout: {
          block: config.cloneTimeoutMs,
        },
      });

      // Clone with depth 1 for efficiency (shallow clone)
      await git.clone(url, workspacePath, [
        '--depth=1',
        '--single-branch',
        `--branch=${branch}`,
        '--no-tags',
      ]);

      // Get commit SHA
      const log = await git.log(['-1']);
      const commitSha = log.latest?.hash || 'unknown';

      return {
        path: workspacePath,
        commitSha,
        branch,
      };
    } catch (error) {
      // Cleanup on error
      try {
        await fs.rm(workspacePath, { recursive: true, force: true });
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      if (error instanceof Error) {
        // Provide user-friendly error messages
        if (error.message.includes('timeout')) {
          throw new Error('Repository clone timed out');
        }
        if (error.message.includes('not found') || error.message.includes('404')) {
          throw new Error('Repository not found or not accessible');
        }
        if (error.message.includes('authentication')) {
          throw new Error('Repository requires authentication (private repository)');
        }
      }

      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cleanup workspace directory
   */
  async cleanupWorkspace(workspacePath: string): Promise<void> {
    try {
      // Verify path is within allowed workspace
      const normalizedPath = path.normalize(workspacePath);
      const normalizedWorkspace = path.normalize(config.repositoryWorkspace);
      
      if (!normalizedPath.startsWith(normalizedWorkspace)) {
        throw new Error('Invalid workspace path');
      }

      await fs.rm(workspacePath, { recursive: true, force: true });
    } catch (error) {
      // Log but don't throw - cleanup is best-effort
      console.error('Failed to cleanup workspace:', error);
    }
  }

  /**
   * Validate that workspace exists and is safe
   */
  async validateWorkspace(workspacePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(workspacePath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }
}
