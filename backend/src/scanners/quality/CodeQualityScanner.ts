import { promises as fs } from 'fs';
import path from 'path';
import {
  Scanner,
  ScanContext,
  ScannerResult,
  Finding,
} from '../types.js';
import { generateFingerprint } from '../utils/fingerprint.js';

/**
 * Code Quality Scanner
 * Detects code smells, complexity issues, and quality problems
 */
export class CodeQualityScanner implements Scanner {
  readonly name = 'code-quality-scanner';
  readonly description = 'Detects code smells, complexity issues, and quality problems';
  readonly category = 'QUALITY';
  readonly version = '1.0.0';

  // Thresholds
  private readonly MAX_FUNCTION_LINES = 50;
  private readonly MAX_FILE_LINES = 500;
  private readonly MAX_PARAMS = 5;
  private readonly MAX_NESTING = 4;

  async shouldRun(context: ScanContext): Promise<boolean> {
    // Run for JavaScript/TypeScript projects
    const languages = context.manifest.languages;
    return languages.includes('JavaScript') || languages.includes('TypeScript');
  }

  async scan(context: ScanContext): Promise<ScannerResult> {
    const findings: Finding[] = [];

    try {
      // Scan source files
      for (const file of context.manifest.files) {
        if (file.type !== 'source') continue;

        const ext = path.extname(file.path);
        if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) continue;

        const fileFindings = await this.scanFile(
          path.join(context.workspacePath, file.path),
          file.path
        );

        findings.push(...fileFindings);
      }

      return {
        findings,
        metadata: {
          filesScanned: findings.length > 0 ? context.manifest.files.filter(f => f.type === 'source').length : 0,
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

  private async scanFile(fullPath: string, relativePath: string): Promise<Finding[]> {
    const findings: Finding[] = [];

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const lines = content.split('\n');

      // Check file length
      if (lines.length > this.MAX_FILE_LINES) {
        findings.push({
          category: 'QUALITY',
          severity: 'MEDIUM',
          title: 'Large File',
          description: `File has ${lines.length} lines (recommended max: ${this.MAX_FILE_LINES}). Consider splitting into smaller modules.`,
          location: { file: relativePath },
          confidence: 1.0,
          fingerprint: generateFingerprint(this.name, 'QUALITY', 'MEDIUM', 'large-file', { file: relativePath }),
          scanner: this.name,
        });
      }

      // Check for TODO/FIXME comments
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (/\/\/\s*(TODO|FIXME|HACK|XXX)/i.test(line)) {
          const match = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX)[:\s]*(.*)/i);
          const type = match?.[1] || 'TODO';
          const comment = match?.[2] || '';

          findings.push({
            category: 'QUALITY',
            severity: type === 'FIXME' || type === 'HACK' ? 'MEDIUM' : 'LOW',
            title: `${type} Comment`,
            description: `${type} comment found: ${comment.substring(0, 100)}`,
            location: { file: relativePath, line: i + 1 },
            snippet: {
              code: line.trim(),
              language: 'typescript',
              startLine: i + 1,
              endLine: i + 1,
            },
            confidence: 1.0,
            fingerprint: generateFingerprint(this.name, 'QUALITY', 'LOW', `${type}-comment`, { file: relativePath, line: i + 1 }),
            scanner: this.name,
          });
        }
      }

      // Check for console.log (in non-test files)
      if (!relativePath.includes('.test.') && !relativePath.includes('.spec.')) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (/console\.(log|debug|info|warn|error)/.test(line) && !line.trim().startsWith('//')) {
            findings.push({
              category: 'QUALITY',
              severity: 'LOW',
              title: 'Console Statement',
              description: 'Console statement found in production code. Consider using a proper logger.',
              location: { file: relativePath, line: i + 1 },
              snippet: {
                code: line.trim(),
                language: 'typescript',
                startLine: i + 1,
                endLine: i + 1,
              },
              confidence: 0.9,
              fingerprint: generateFingerprint(this.name, 'QUALITY', 'LOW', 'console-log', { file: relativePath, line: i + 1 }),
              scanner: this.name,
            });
          }
        }
      }

      // Check for long functions
      const functions = this.extractFunctions(content);
      for (const func of functions) {
        if (func.lines > this.MAX_FUNCTION_LINES) {
          findings.push({
            category: 'QUALITY',
            severity: 'MEDIUM',
            title: 'Long Function',
            description: `Function '${func.name}' has ${func.lines} lines (recommended max: ${this.MAX_FUNCTION_LINES}). Consider breaking it into smaller functions.`,
            location: { file: relativePath, line: func.startLine },
            confidence: 0.95,
            fingerprint: generateFingerprint(this.name, 'QUALITY', 'MEDIUM', `long-function-${func.name}`, { file: relativePath, line: func.startLine }),
            scanner: this.name,
            metadata: {
              functionName: func.name,
              lineCount: func.lines,
            },
          });
        }

        // Check for too many parameters
        if (func.params > this.MAX_PARAMS) {
          findings.push({
            category: 'QUALITY',
            severity: 'LOW',
            title: 'Too Many Parameters',
            description: `Function '${func.name}' has ${func.params} parameters (recommended max: ${this.MAX_PARAMS}). Consider using an options object.`,
            location: { file: relativePath, line: func.startLine },
            confidence: 0.9,
            fingerprint: generateFingerprint(this.name, 'QUALITY', 'LOW', `many-params-${func.name}`, { file: relativePath, line: func.startLine }),
            scanner: this.name,
            metadata: {
              functionName: func.name,
              paramCount: func.params,
            },
          });
        }
      }

      // Check for deep nesting
      const maxNesting = this.getMaxNesting(content);
      if (maxNesting > this.MAX_NESTING) {
        findings.push({
          category: 'QUALITY',
          severity: 'MEDIUM',
          title: 'Deep Nesting',
          description: `File has deep nesting (depth: ${maxNesting}, max recommended: ${this.MAX_NESTING}). Consider refactoring to reduce complexity.`,
          location: { file: relativePath },
          confidence: 0.85,
          fingerprint: generateFingerprint(this.name, 'QUALITY', 'MEDIUM', 'deep-nesting', { file: relativePath }),
          scanner: this.name,
          metadata: {
            nestingDepth: maxNesting,
          },
        });
      }

    } catch (error) {
      // Skip files that can't be read
    }

    return findings;
  }

  private extractFunctions(content: string): Array<{
    name: string;
    startLine: number;
    lines: number;
    params: number;
  }> {
    const functions: Array<{
      name: string;
      startLine: number;
      lines: number;
      params: number;
    }> = [];

    // Match function declarations (simplified)
    const functionPattern = /(?:function|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:=\s*)?(?:async\s*)?\([^)]*\)/g;
    const lines = content.split('\n');

    let match: RegExpExecArray | null;
    while ((match = functionPattern.exec(content)) !== null) {
      const name = match[1];
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      // Count parameters
      const paramsMatch = match[0].match(/\(([^)]*)\)/);
      const params = paramsMatch?.[1]
        ? paramsMatch[1].split(',').filter(p => p.trim()).length
        : 0;

      // Estimate function length (rough approximation)
      let braceCount = 0;
      let functionLines = 0;
      let found = false;

      for (let i = startLine - 1; i < lines.length; i++) {
        const line = lines[i];
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        functionLines++;

        if (braceCount === 0 && found) {
          break;
        }

        if (braceCount > 0) {
          found = true;
        }

        if (functionLines > 200) break; // Prevent infinite loops
      }

      functions.push({
        name,
        startLine,
        lines: functionLines,
        params,
      });
    }

    return functions;
  }

  private getMaxNesting(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of content) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }

    return maxDepth;
  }
}
