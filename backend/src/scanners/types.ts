/**
 * Scanner Types and Interfaces
 */

import { RepositoryManifest } from '../types/index.js';

export type ScanCategory = 
  | 'SECURITY'      // Security vulnerabilities, secrets
  | 'QUALITY'       // Code quality, complexity, smells
  | 'DEPENDENCY'    // Package vulnerabilities, outdated deps
  | 'ARCHITECTURE'  // Design patterns, structure issues
  | 'BUILD'         // Build errors, configuration
  | 'TEST'          // Test coverage, failing tests
  | 'RUNTIME';      // Performance, resource usage

export type FindingSeverity = 
  | 'CRITICAL'  // Immediate action required
  | 'HIGH'      // Should be fixed soon
  | 'MEDIUM'    // Should be addressed
  | 'LOW'       // Nice to fix
  | 'INFO';     // Informational only

export interface FileLocation {
  file: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
}

export interface CodeSnippet {
  code: string;
  language?: string;
  startLine: number;
  endLine: number;
}

export interface Finding {
  category: ScanCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  location?: FileLocation;
  snippet?: CodeSnippet;
  evidence?: Record<string, any>;
  confidence: number; // 0.0 - 1.0
  fingerprint: string; // For deduplication
  scanner: string;
  metadata?: Record<string, any>;
}

export interface ScanContext {
  scanId: string;
  workspacePath: string;
  manifest: RepositoryManifest;
  repository: {
    provider: string;
    owner: string;
    name: string;
    fullName: string;
    url: string;
  };
  commitSha: string;
  branch: string;
}

export interface ScannerResult {
  findings: Finding[];
  metadata?: Record<string, any>;
  error?: string;
}

/**
 * Base Scanner Interface
 */
export interface Scanner {
  readonly name: string;
  readonly description: string;
  readonly category: ScanCategory;
  readonly version: string;
  
  /**
   * Check if scanner should run for this repository
   */
  shouldRun(context: ScanContext): Promise<boolean>;
  
  /**
   * Run the scanner
   */
  scan(context: ScanContext): Promise<ScannerResult>;
}

/**
 * Scanner configuration
 */
export interface ScannerConfig {
  enabled: boolean;
  timeout?: number;
  options?: Record<string, any>;
}

/**
 * Scanner execution result with timing
 */
export interface ScannerExecution {
  scanner: string;
  category: ScanCategory;
  findings: Finding[];
  durationMs: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export class ScannerError extends Error {
  constructor(
    message: string,
    public readonly scanner: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ScannerError';
  }
}

export class ScannerTimeoutError extends Error {
  constructor(
    public readonly scanner: string,
    public readonly timeoutMs: number
  ) {
    super(`Scanner ${scanner} timed out after ${timeoutMs}ms`);
    this.name = 'ScannerTimeoutError';
  }
}
