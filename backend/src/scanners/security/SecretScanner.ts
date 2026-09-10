import { promises as fs } from 'fs';
import path from 'path';
import {
  Scanner,
  ScanContext,
  ScannerResult,
  Finding,
  FindingSeverity,
} from '../types.js';
import { generateFingerprint } from '../utils/fingerprint.js';

/**
 * Secret patterns to detect
 */
const SECRET_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  severity: FindingSeverity;
  description: string;
}> = [
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    description: 'AWS Access Key ID detected',
  },
  {
    name: 'Generic API Key',
    pattern: /api[_-]?key[_-]?[=:]\s*["']?([a-zA-Z0-9_\-]{20,})["']?/gi,
    severity: 'HIGH',
    description: 'Potential API key detected',
  },
  {
    name: 'Generic Secret',
    pattern: /secret[_-]?[=:]\s*["']?([a-zA-Z0-9_\-]{16,})["']?/gi,
    severity: 'HIGH',
    description: 'Potential secret detected',
  },
  {
    name: 'GitHub Token',
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g,
    severity: 'CRITICAL',
    description: 'GitHub personal access token detected',
  },
  {
    name: 'NPM Token',
    pattern: /npm_[A-Za-z0-9]{36}/g,
    severity: 'CRITICAL',
    description: 'NPM access token detected',
  },
  {
    name: 'Slack Token',
    pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}/g,
    severity: 'HIGH',
    description: 'Slack token detected',
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (?:RSA|OPENSSH|DSA|EC|PGP) PRIVATE KEY-----/g,
    severity: 'CRITICAL',
    description: 'Private key detected',
  },
  {
    name: 'JWT Token',
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    severity: 'HIGH',
    description: 'JWT token detected',
  },
  {
    name: 'Database Connection String',
    pattern: /(postgres|mysql|mongodb):\/\/[^\s"']+/gi,
    severity: 'HIGH',
    description: 'Database connection string detected',
  },
];

/**
 * Files to skip (likely false positives)
 */
const SKIP_FILES = new Set([
  '.git',
  'node_modules',
  'vendor',
  'dist',
  'build',
  'coverage',
  '.next',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
]);

/**
 * File extensions to scan
 */
const SCAN_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx',
  '.py', '.rb', '.go', '.rs',
  '.java', '.kt', '.cs',
  '.php', '.sh', '.bash',
  '.yml', '.yaml', '.json',
  '.env', '.config', '.ini',
  '.sql', '.md', '.txt',
]);

/**
 * Secret Scanner
 * Detects hardcoded secrets and credentials in source code
 */
export class SecretScanner implements Scanner {
  readonly name = 'secret-scanner';
  readonly description = 'Detects hardcoded secrets, API keys, and credentials';
  readonly category = 'SECURITY';
  readonly version = '1.0.0';

  async shouldRun(_context: ScanContext): Promise<boolean> {
    // Always run for security
    return true;
  }

  async scan(context: ScanContext): Promise<ScannerResult> {
    const findings: Finding[] = [];

    try {
      // Scan files in manifest
      for (const file of context.manifest.files) {
        // Skip non-source files
        const ext = path.extname(file.path);
        if (!SCAN_EXTENSIONS.has(ext)) {
          continue;
        }

        // Skip excluded directories
        if (this.shouldSkipFile(file.path)) {
          continue;
        }

        // Scan file for secrets
        const fileFindings = await this.scanFile(
          path.join(context.workspacePath, file.path),
          file.path
        );

        findings.push(...fileFindings);
      }

      return {
        findings,
        metadata: {
          filesScanned: context.manifest.files.length,
          secretsFound: findings.length,
        },
      };
    } catch (error) {
      return {
        findings,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async scanFile(fullPath: string, relativePath: string): Promise<Finding[]> {
    const findings: Finding[] = [];

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const lines = content.split('\n');

      // Check each pattern
      for (const { name, pattern, severity, description } of SECRET_PATTERNS) {
        // Reset regex
        pattern.lastIndex = 0;

        let match: RegExpExecArray | null;
        while ((match = pattern.exec(content)) !== null) {
          // Calculate line number
          const lineNumber = this.getLineNumber(content, match.index);
          const line = lines[lineNumber - 1];

          // Skip if it looks like a comment or example
          if (this.isLikelyFalsePositive(line, match[0])) {
            continue;
          }

          findings.push({
            category: 'SECURITY',
            severity,
            title: `Hardcoded Secret: ${name}`,
            description,
            location: {
              file: relativePath,
              line: lineNumber,
            },
            snippet: {
              code: this.redactSecret(line),
              language: this.getLanguage(relativePath),
              startLine: lineNumber,
              endLine: lineNumber,
            },
            evidence: {
              secretType: name,
              redactedValue: this.redactSecret(match[0]),
            },
            confidence: 0.85, // High confidence for pattern matches
            fingerprint: generateFingerprint(
              this.name,
              'SECURITY',
              severity,
              `secret-${name}`,
              { file: relativePath, line: lineNumber }
            ),
            scanner: this.name,
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }

    return findings;
  }

  private shouldSkipFile(filePath: string): boolean {
    const parts = filePath.split(path.sep);
    return parts.some(part => SKIP_FILES.has(part));
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private getLanguage(filePath: string): string {
    const ext = path.extname(filePath);
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java',
      '.kt': 'kotlin',
      '.cs': 'csharp',
      '.php': 'php',
      '.sh': 'bash',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.json': 'json',
    };
    return languageMap[ext] || 'text';
  }

  private redactSecret(text: string): string {
    // Redact the secret, keeping only first and last few characters
    if (text.length <= 8) {
      return '***';
    }
    return `${text.substring(0, 4)}...${text.substring(text.length - 4)}`;
  }

  private isLikelyFalsePositive(line: string, match: string): boolean {
    const lowerLine = line.toLowerCase();
    
    // Check for comments
    if (lowerLine.includes('//') || lowerLine.includes('#') || lowerLine.includes('/*')) {
      return true;
    }

    // Check for example/placeholder patterns
    const placeholders = [
      'example',
      'placeholder',
      'your_',
      'my_',
      'dummy',
      'fake',
      'test',
      'sample',
      '<',
      '>',
      'xxx',
    ];

    for (const placeholder of placeholders) {
      if (match.toLowerCase().includes(placeholder)) {
        return true;
      }
    }

    return false;
  }
}
