import { promises as fs } from 'fs';
import path from 'path';
import {
  Scanner,
  ScanContext,
  ScannerResult,
  Finding,
} from '../types.js';
import { generateFingerprint } from '../utils/fingerprint.js';

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Dependency Scanner
 * Checks for outdated dependencies and potential vulnerabilities
 */
export class DependencyScanner implements Scanner {
  readonly name = 'dependency-scanner';
  readonly description = 'Checks for outdated and vulnerable dependencies';
  readonly category = 'DEPENDENCY';
  readonly version = '1.0.0';

  async shouldRun(context: ScanContext): Promise<boolean> {
    // Run if package.json exists
    return context.manifest.packageManagers.includes('npm') ||
           context.manifest.packageManagers.includes('yarn') ||
           context.manifest.packageManagers.includes('pnpm');
  }

  async scan(context: ScanContext): Promise<ScannerResult> {
    const findings: Finding[] = [];

    try {
      // Check for package.json
      const packageJsonPath = path.join(context.workspacePath, 'package.json');
      
      try {
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson: PackageJson = JSON.parse(content);

        // Check dependencies
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        for (const [name, version] of Object.entries(deps)) {
          // Check for wildcard versions (bad practice)
          if (version === '*' || version === 'latest') {
            findings.push({
              category: 'DEPENDENCY',
              severity: 'MEDIUM',
              title: 'Unpinned Dependency Version',
              description: `Package '${name}' uses wildcard version ('${version}'). This can lead to unexpected breaks. Pin to a specific version or range.`,
              location: { file: 'package.json' },
              confidence: 1.0,
              fingerprint: generateFingerprint(this.name, 'DEPENDENCY', 'MEDIUM', `unpinned-${name}`, { file: 'package.json' }),
              scanner: this.name,
              metadata: {
                package: name,
                version,
              },
            });
          }

          // Check for deprecated packages (known list)
          if (this.isDeprecatedPackage(name)) {
            findings.push({
              category: 'DEPENDENCY',
              severity: 'HIGH',
              title: 'Deprecated Package',
              description: `Package '${name}' is deprecated and should be replaced with an alternative.`,
              location: { file: 'package.json' },
              confidence: 1.0,
              fingerprint: generateFingerprint(this.name, 'DEPENDENCY', 'HIGH', `deprecated-${name}`, { file: 'package.json' }),
              scanner: this.name,
              metadata: {
                package: name,
                version,
                alternative: this.getAlternative(name),
              },
            });
          }

          // Check for very old major versions
          if (this.isVeryOldVersion(version)) {
            findings.push({
              category: 'DEPENDENCY',
              severity: 'MEDIUM',
              title: 'Outdated Dependency',
              description: `Package '${name}' is using a very old version (${version}). Consider updating to get security patches and new features.`,
              location: { file: 'package.json' },
              confidence: 0.8,
              fingerprint: generateFingerprint(this.name, 'DEPENDENCY', 'MEDIUM', `outdated-${name}`, { file: 'package.json' }),
              scanner: this.name,
              metadata: {
                package: name,
                currentVersion: version,
              },
            });
          }
        }

        // Check for missing lock file
        const hasLockFile = await this.hasLockFile(context.workspacePath, context.manifest.packageManagers);
        if (!hasLockFile) {
          findings.push({
            category: 'DEPENDENCY',
            severity: 'HIGH',
            title: 'Missing Lock File',
            description: 'No lock file found (package-lock.json, yarn.lock, or pnpm-lock.yaml). Lock files ensure consistent dependency versions across environments.',
            location: { file: 'package.json' },
            confidence: 1.0,
            fingerprint: generateFingerprint(this.name, 'DEPENDENCY', 'HIGH', 'missing-lock-file', { file: 'package.json' }),
            scanner: this.name,
          });
        }

        // Check for many dependencies (might indicate code bloat)
        const depCount = Object.keys(deps).length;
        if (depCount > 50) {
          findings.push({
            category: 'DEPENDENCY',
            severity: 'LOW',
            title: 'Many Dependencies',
            description: `Project has ${depCount} dependencies. Consider reviewing if all are necessary to reduce bundle size and security surface.`,
            location: { file: 'package.json' },
            confidence: 0.7,
            fingerprint: generateFingerprint(this.name, 'DEPENDENCY', 'LOW', 'many-deps', { file: 'package.json' }),
            scanner: this.name,
            metadata: {
              dependencyCount: depCount,
            },
          });
        }

      } catch (error) {
        // package.json not found or invalid
      }

      return {
        findings,
        metadata: {
          issuesFound: findings.length,
        },
      };
    } catch (error) {
      return {
        findings,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async hasLockFile(workspacePath: string, _packageManagers: string[]): Promise<boolean> {
    const lockFiles = [
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ];

    for (const lockFile of lockFiles) {
      try {
        await fs.access(path.join(workspacePath, lockFile));
        return true;
      } catch {
        continue;
      }
    }

    return false;
  }

  private isDeprecatedPackage(name: string): boolean {
    const deprecated = [
      'request',
      'gulp-util',
      'babel-preset-es2015',
      'babel-preset-es2016',
      'babel-preset-es2017',
      'node-uuid',
    ];

    return deprecated.includes(name);
  }

  private getAlternative(name: string): string | undefined {
    const alternatives: Record<string, string> = {
      'request': 'axios, node-fetch, or got',
      'gulp-util': 'individual gulp utilities',
      'node-uuid': 'uuid',
    };

    return alternatives[name];
  }

  private isVeryOldVersion(version: string): boolean {
    // Extract major version
    const match = version.match(/(\d+)\./);
    if (!match) return false;

    const major = parseInt(match[1], 10);

    // If major version is 0 or 1, it might be very old
    // This is a simple heuristic
    return major === 0 || major === 1;
  }
}
