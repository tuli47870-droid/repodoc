import pLimit from 'p-limit';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';
import {
  Scanner,
  ScanContext,
  ScannerExecution,
  ScannerTimeoutError,
  Finding,
} from './types.js';
import { ScannerRegistry } from './ScannerRegistry.js';

const logger = createLogger();

/**
 * Scanner Executor
 * Executes scanners in parallel with timeout and error handling
 */
export class ScannerExecutor {
  /**
   * Execute all enabled scanners
   */
  static async executeAll(context: ScanContext): Promise<ScannerExecution[]> {
    const scanners = ScannerRegistry.getEnabled();
    
    if (scanners.length === 0) {
      logger.warn({ scanId: context.scanId }, 'No scanners enabled');
      return [];
    }

    logger.info(
      { scanId: context.scanId, scanners: scanners.length },
      'Starting scanner execution'
    );

    // Filter scanners that should run for this repository
    const runnableScanners: Scanner[] = [];
    for (const scanner of scanners) {
      try {
        const shouldRun = await scanner.shouldRun(context);
        if (shouldRun) {
          runnableScanners.push(scanner);
        } else {
          logger.debug(
            { scanId: context.scanId, scanner: scanner.name },
            'Scanner skipped (shouldRun returned false)'
          );
        }
      } catch (error) {
        logger.error(
          { scanId: context.scanId, scanner: scanner.name, error },
          'Error checking if scanner should run'
        );
      }
    }

    if (runnableScanners.length === 0) {
      logger.warn({ scanId: context.scanId }, 'No scanners applicable for this repository');
      return [];
    }

    logger.info(
      { scanId: context.scanId, scanners: runnableScanners.length },
      'Executing applicable scanners'
    );

    // Execute scanners in parallel with concurrency limit
    const limit = pLimit(config.scannerConcurrency);
    
    const executions = await Promise.all(
      runnableScanners.map(scanner =>
        limit(() => this.executeScanner(scanner, context))
      )
    );

    // Log summary
    const successful = executions.filter(e => e.success).length;
    const failed = executions.length - successful;
    const totalFindings = executions.reduce((sum, e) => sum + e.findings.length, 0);

    logger.info(
      {
        scanId: context.scanId,
        successful,
        failed,
        totalFindings,
      },
      'Scanner execution completed'
    );

    return executions;
  }

  /**
   * Execute a single scanner
   */
  static async executeScanner(
    scanner: Scanner,
    context: ScanContext
  ): Promise<ScannerExecution> {
    const startTime = Date.now();
    
    logger.info(
      { scanId: context.scanId, scanner: scanner.name, category: scanner.category },
      'Starting scanner'
    );

    try {
      // Get scanner config
      const scannerConfig = ScannerRegistry.getConfig(scanner.name);
      const timeout = scannerConfig?.timeout || config.scannerTimeoutMs;

      // Execute with timeout
      const result = await this.withTimeout(
        scanner.scan(context),
        timeout,
        scanner.name
      );

      const durationMs = Date.now() - startTime;

      // Deduplicate findings
      const uniqueFindings = this.deduplicateFindings(result.findings);

      logger.info(
        {
          scanId: context.scanId,
          scanner: scanner.name,
          findings: uniqueFindings.length,
          durationMs,
        },
        'Scanner completed successfully'
      );

      return {
        scanner: scanner.name,
        category: scanner.category,
        findings: uniqueFindings,
        durationMs,
        success: true,
        metadata: result.metadata,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      
      logger.error(
        {
          scanId: context.scanId,
          scanner: scanner.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          durationMs,
        },
        'Scanner failed'
      );

      return {
        scanner: scanner.name,
        category: scanner.category,
        findings: [],
        durationMs,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute a promise with timeout
   */
  private static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    scannerName: string
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new ScannerTimeoutError(scannerName, timeoutMs));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId!);
      return result;
    } catch (error) {
      clearTimeout(timeoutId!);
      throw error;
    }
  }

  /**
   * Deduplicate findings by fingerprint
   */
  private static deduplicateFindings(findings: Finding[]): Finding[] {
    const seen = new Set<string>();
    const unique: Finding[] = [];

    for (const finding of findings) {
      if (!seen.has(finding.fingerprint)) {
        seen.add(finding.fingerprint);
        unique.push(finding);
      }
    }

    if (findings.length !== unique.length) {
      logger.debug(
        {
          original: findings.length,
          unique: unique.length,
          duplicates: findings.length - unique.length,
        },
        'Deduplicated findings'
      );
    }

    return unique;
  }

  /**
   * Get findings statistics
   */
  static getFindingsStats(executions: ScannerExecution[]): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    byScanner: Record<string, number>;
  } {
    const allFindings = executions.flatMap(e => e.findings);

    const bySeverity: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byScanner: Record<string, number> = {};

    for (const finding of allFindings) {
      bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
      byCategory[finding.category] = (byCategory[finding.category] || 0) + 1;
      byScanner[finding.scanner] = (byScanner[finding.scanner] || 0) + 1;
    }

    return {
      total: allFindings.length,
      bySeverity,
      byCategory,
      byScanner,
    };
  }
}
