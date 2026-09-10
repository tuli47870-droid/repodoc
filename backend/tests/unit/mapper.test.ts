import { describe, it, expect } from 'vitest';
import { RepositoryMapperService } from '../../src/services/RepositoryMapperService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('RepositoryMapperService', () => {
  const mapper = new RepositoryMapperService();
  const fixturePath = path.join(__dirname, '../fixtures/sample-repo');

  it('should generate manifest for sample repository', async () => {
    const manifest = await mapper.generateManifest({
      workspace: fixturePath,
      repository: {
        provider: 'github',
        owner: 'test',
        name: 'sample-repo',
        fullName: 'test/sample-repo',
        url: 'https://github.com/test/sample-repo',
      },
      commit: 'abc123',
      branch: 'main',
    });

    expect(manifest.repository.fullName).toBe('test/sample-repo');
    expect(manifest.commit).toBe('abc123');
    expect(manifest.fileCount).toBeGreaterThan(0);
    expect(manifest.languages).toContain('TypeScript');
    expect(manifest.packageManagers).toContain('npm');
  });

  it('should detect TypeScript files', async () => {
    const manifest = await mapper.generateManifest({
      workspace: fixturePath,
      repository: {
        provider: 'github',
        owner: 'test',
        name: 'sample-repo',
        fullName: 'test/sample-repo',
        url: 'https://github.com/test/sample-repo',
      },
      commit: 'abc123',
      branch: 'main',
    });

    const tsFiles = manifest.files.filter(f => f.path.endsWith('.ts'));
    expect(tsFiles.length).toBeGreaterThan(0);
  });

  it('should calculate total file size', async () => {
    const manifest = await mapper.generateManifest({
      workspace: fixturePath,
      repository: {
        provider: 'github',
        owner: 'test',
        name: 'sample-repo',
        fullName: 'test/sample-repo',
        url: 'https://github.com/test/sample-repo',
      },
      commit: 'abc123',
      branch: 'main',
    });

    expect(manifest.totalSizeBytes).toBeGreaterThan(0);
  });
});
