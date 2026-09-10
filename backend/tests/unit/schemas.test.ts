import { describe, it, expect } from 'vitest';
import { parseGitHubUrl } from '../../src/schemas/repository.js';

describe('GitHub URL Parser', () => {
  it('should parse valid GitHub URL', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react');
    
    expect(result).toEqual({
      provider: 'github',
      owner: 'facebook',
      name: 'react',
      fullName: 'facebook/react',
    });
  });

  it('should parse GitHub URL with .git suffix', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo.git');
    
    expect(result).toEqual({
      provider: 'github',
      owner: 'owner',
      name: 'repo',
      fullName: 'owner/repo',
    });
  });

  it('should return null for invalid URL', () => {
    const result = parseGitHubUrl('https://gitlab.com/owner/repo');
    expect(result).toBeNull();
  });

  it('should return null for non-GitHub URL', () => {
    const result = parseGitHubUrl('https://example.com/repo');
    expect(result).toBeNull();
  });

  it('should handle URLs with hyphens and underscores', () => {
    const result = parseGitHubUrl('https://github.com/my-org/my_repo');
    
    expect(result).toEqual({
      provider: 'github',
      owner: 'my-org',
      name: 'my_repo',
      fullName: 'my-org/my_repo',
    });
  });
});
