import { Scanner, ScanCategory, ScannerConfig } from './types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger();

/**
 * Scanner Registry
 * Manages scanner registration and retrieval
 */
export class ScannerRegistry {
  private static scanners: Map<string, Scanner> = new Map();
  private static configs: Map<string, ScannerConfig> = new Map();

  /**
   * Register a scanner
   */
  static register(scanner: Scanner, config?: ScannerConfig): void {
    if (this.scanners.has(scanner.name)) {
      logger.warn({ scanner: scanner.name }, 'Scanner already registered, replacing');
    }

    this.scanners.set(scanner.name, scanner);
    
    // Set default config if not provided
    if (!this.configs.has(scanner.name)) {
      this.configs.set(scanner.name, config || { enabled: true });
    } else if (config) {
      this.configs.set(scanner.name, config);
    }

    logger.info({ scanner: scanner.name, category: scanner.category }, 'Scanner registered');
  }

  /**
   * Unregister a scanner
   */
  static unregister(name: string): boolean {
    const removed = this.scanners.delete(name);
    this.configs.delete(name);
    
    if (removed) {
      logger.info({ scanner: name }, 'Scanner unregistered');
    }
    
    return removed;
  }

  /**
   * Get a scanner by name
   */
  static get(name: string): Scanner | undefined {
    return this.scanners.get(name);
  }

  /**
   * Get all registered scanners
   */
  static getAll(): Scanner[] {
    return Array.from(this.scanners.values());
  }

  /**
   * Get enabled scanners
   */
  static getEnabled(): Scanner[] {
    return Array.from(this.scanners.entries())
      .filter(([name]) => this.isEnabled(name))
      .map(([_, scanner]) => scanner);
  }

  /**
   * Get scanners by category
   */
  static getByCategory(category: ScanCategory): Scanner[] {
    return this.getAll().filter(s => s.category === category);
  }

  /**
   * Check if a scanner is enabled
   */
  static isEnabled(name: string): boolean {
    const config = this.configs.get(name);
    return config?.enabled ?? true;
  }

  /**
   * Enable a scanner
   */
  static enable(name: string): void {
    const config = this.configs.get(name) || { enabled: true };
    config.enabled = true;
    this.configs.set(name, config);
    logger.info({ scanner: name }, 'Scanner enabled');
  }

  /**
   * Disable a scanner
   */
  static disable(name: string): void {
    const config = this.configs.get(name) || { enabled: false };
    config.enabled = false;
    this.configs.set(name, config);
    logger.info({ scanner: name }, 'Scanner disabled');
  }

  /**
   * Get scanner configuration
   */
  static getConfig(name: string): ScannerConfig | undefined {
    return this.configs.get(name);
  }

  /**
   * Set scanner configuration
   */
  static setConfig(name: string, config: ScannerConfig): void {
    this.configs.set(name, config);
  }

  /**
   * Clear all scanners (useful for testing)
   */
  static clear(): void {
    this.scanners.clear();
    this.configs.clear();
    logger.info('Scanner registry cleared');
  }

  /**
   * Get registry statistics
   */
  static getStats(): {
    total: number;
    enabled: number;
    byCategory: Record<ScanCategory, number>;
  } {
    const all = this.getAll();
    const enabled = this.getEnabled();
    
    const byCategory: Record<ScanCategory, number> = {
      SECURITY: 0,
      QUALITY: 0,
      DEPENDENCY: 0,
      ARCHITECTURE: 0,
      BUILD: 0,
      TEST: 0,
      RUNTIME: 0,
    };

    for (const scanner of all) {
      byCategory[scanner.category]++;
    }

    return {
      total: all.length,
      enabled: enabled.length,
      byCategory,
    };
  }
}
