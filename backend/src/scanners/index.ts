/**
 * Scanner exports
 */

// Core
export * from './types.js';
export * from './ScannerRegistry.js';
export * from './ScannerExecutor.js';

// Utilities
export * from './utils/fingerprint.js';

// Scanners
export * from './security/SecretScanner.js';
export * from './quality/CodeQualityScanner.js';
export * from './dependency/DependencyScanner.js';

// Initialize scanners
import { ScannerRegistry } from './ScannerRegistry.js';
import { SecretScanner } from './security/SecretScanner.js';
import { CodeQualityScanner } from './quality/CodeQualityScanner.js';
import { DependencyScanner } from './dependency/DependencyScanner.js';

/**
 * Register all built-in scanners
 */
export function registerBuiltInScanners(): void {
  ScannerRegistry.register(new SecretScanner());
  ScannerRegistry.register(new CodeQualityScanner());
  ScannerRegistry.register(new DependencyScanner());
}
