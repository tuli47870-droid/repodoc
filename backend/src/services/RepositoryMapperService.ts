import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { RepositoryManifest, FileInfo } from '../types/index.js';

export interface GenerateManifestOptions {
  workspace: string;
  repository: {
    provider: string;
    owner: string;
    name: string;
    fullName: string;
    url: string;
  };
  commit: string;
  branch: string;
}

// Directories to ignore during scanning
const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'vendor',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.next',
  '.nuxt',
  'target',
  'bin',
  'obj',
  '__pycache__',
  '.venv',
  'venv',
  '.pytest_cache',
  '.tox',
  'out',
  '.gradle',
]);

// File extensions by language
const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  JavaScript: ['.js', '.jsx', '.mjs', '.cjs'],
  TypeScript: ['.ts', '.tsx'],
  Python: ['.py'],
  Go: ['.go'],
  Rust: ['.rs'],
  Java: ['.java'],
  Kotlin: ['.kt', '.kts'],
  'C#': ['.cs'],
  PHP: ['.php'],
  Ruby: ['.rb'],
  Swift: ['.swift'],
  C: ['.c', '.h'],
  'C++': ['.cpp', '.cc', '.cxx', '.hpp'],
};

// Configuration files by package manager
const PACKAGE_MANAGER_FILES: Record<string, string[]> = {
  npm: ['package.json', 'package-lock.json'],
  yarn: ['yarn.lock'],
  pnpm: ['pnpm-lock.yaml'],
  pip: ['requirements.txt', 'setup.py', 'pyproject.toml'],
  poetry: ['poetry.lock'],
  go: ['go.mod', 'go.sum'],
  cargo: ['Cargo.toml', 'Cargo.lock'],
  maven: ['pom.xml'],
  gradle: ['build.gradle', 'build.gradle.kts'],
  composer: ['composer.json', 'composer.lock'],
  bundler: ['Gemfile', 'Gemfile.lock'],
};

export class RepositoryMapperService {
  /**
   * Generate a repository manifest without executing any code
   * SECURITY: Only reads files, never executes them
   */
  async generateManifest(options: GenerateManifestOptions): Promise<RepositoryManifest> {
    const { workspace, repository, commit, branch } = options;

    const files: FileInfo[] = [];
    const directories = new Set<string>();
    const languageCounts: Record<string, number> = {};
    let totalSizeBytes = 0;
    let fileCount = 0;

    // Scan directory
    const scanStats = {
      files,
      directories,
      languageCounts,
      totalSize: { value: totalSizeBytes },
      fileCount: { value: fileCount },
    };
    
    await this.scanDirectory(workspace, workspace, scanStats);

    // Detect languages (sorted by file count)
    const languages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    // Detect package managers
    const packageManagers = await this.detectPackageManagers(workspace);

    // Detect frameworks
    const frameworks = await this.detectFrameworks(workspace);

    // Detect entry points
    const entryPoints = await this.detectEntryPoints(workspace);

    const manifest: RepositoryManifest = {
      repository,
      commit,
      branch,
      fileCount: files.length,
      totalSizeBytes: scanStats.totalSize.value,
      languages,
      frameworks,
      packageManagers,
      entryPoints,
      directories: Array.from(directories).sort(),
      files: files.sort((a, b) => a.path.localeCompare(b.path)),
    };

    return manifest;
  }

  private async scanDirectory(
    basePath: string,
    currentPath: string,
    stats: {
      files: FileInfo[];
      directories: Set<string>;
      languageCounts: Record<string, number>;
      totalSize: { value: number };
      fileCount: { value: number };
    }
  ): Promise<void> {
    // Check file count limit
    if (stats.fileCount.value >= config.maxRepositoryFiles) {
      return;
    }

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(basePath, fullPath);

        if (entry.isDirectory()) {
          // Skip ignored directories
          if (IGNORED_DIRECTORIES.has(entry.name)) {
            continue;
          }

          stats.directories.add(relativePath);

          // Recursively scan subdirectory
          await this.scanDirectory(basePath, fullPath, stats);
        } else if (entry.isFile()) {
          try {
            const fileStat = await fs.stat(fullPath);
            
            // Skip files that are too large
            if (fileStat.size > config.maxFileSizeBytes) {
              continue;
            }

            // Check total size limit
            if (stats.totalSize.value + fileStat.size > config.maxTotalSizeBytes) {
              continue;
            }

            stats.totalSize.value += fileStat.size;
            stats.fileCount.value++;

            // Detect language
            const ext = path.extname(entry.name);
            const language = this.getLanguageByExtension(ext);
            if (language) {
              stats.languageCounts[language] = (stats.languageCounts[language] || 0) + 1;
            }

            stats.files.push({
              path: relativePath,
              size: fileStat.size,
              type: this.getFileType(entry.name),
            });
          } catch (error) {
            // Skip files that can't be read
            continue;
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
      return;
    }
  }

  private getLanguageByExtension(ext: string): string | null {
    for (const [language, extensions] of Object.entries(LANGUAGE_EXTENSIONS)) {
      if (extensions.includes(ext)) {
        return language;
      }
    }
    return null;
  }

  private getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    if (['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.kt', '.cs', '.php', '.rb'].includes(ext)) {
      return 'source';
    }
    if (['.json', '.yaml', '.yml', '.toml', '.ini', '.conf'].includes(ext)) {
      return 'config';
    }
    if (['.md', '.txt', '.rst'].includes(ext)) {
      return 'documentation';
    }
    if (['.lock', '.sum'].includes(ext)) {
      return 'lock';
    }
    
    return 'other';
  }

  private async detectPackageManagers(workspace: string): Promise<string[]> {
    const detected: string[] = [];

    for (const [manager, files] of Object.entries(PACKAGE_MANAGER_FILES)) {
      for (const file of files) {
        try {
          await fs.access(path.join(workspace, file));
          if (!detected.includes(manager)) {
            detected.push(manager);
          }
          break;
        } catch (error) {
          // File doesn't exist
        }
      }
    }

    return detected.sort();
  }

  private async detectFrameworks(workspace: string): Promise<string[]> {
    const frameworks: string[] = [];

    try {
      // Check for package.json to detect JS frameworks
      const packageJsonPath = path.join(workspace, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.react) frameworks.push('React');
      if (deps.vue) frameworks.push('Vue');
      if (deps.angular) frameworks.push('Angular');
      if (deps.next) frameworks.push('Next.js');
      if (deps.nuxt) frameworks.push('Nuxt.js');
      if (deps.svelte) frameworks.push('Svelte');
      if (deps.express) frameworks.push('Express');
      if (deps.fastify) frameworks.push('Fastify');
    } catch (error) {
      // No package.json or can't read it
    }

    try {
      // Check for requirements.txt for Python frameworks
      const reqPath = path.join(workspace, 'requirements.txt');
      const requirements = await fs.readFile(reqPath, 'utf-8');
      
      if (requirements.includes('django')) frameworks.push('Django');
      if (requirements.includes('flask')) frameworks.push('Flask');
      if (requirements.includes('fastapi')) frameworks.push('FastAPI');
    } catch (error) {
      // No requirements.txt
    }

    return frameworks;
  }

  private async detectEntryPoints(workspace: string): Promise<string[]> {
    const entryPoints: string[] = [];

    const commonEntryPoints = [
      'index.js',
      'index.ts',
      'main.js',
      'main.ts',
      'app.js',
      'app.ts',
      'server.js',
      'server.ts',
      'src/index.js',
      'src/index.ts',
      'src/main.js',
      'src/main.ts',
      'main.go',
      'main.py',
      '__main__.py',
    ];

    for (const entry of commonEntryPoints) {
      try {
        await fs.access(path.join(workspace, entry));
        entryPoints.push(entry);
      } catch (error) {
        // Entry point doesn't exist
      }
    }

    return entryPoints;
  }
}
