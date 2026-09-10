import crypto from 'crypto';
import { Finding, FileLocation } from '../types.js';

/**
 * Generate a fingerprint for a finding
 * Used for deduplication across scans
 */
export function generateFingerprint(
  scanner: string,
  category: string,
  severity: string,
  title: string,
  location?: FileLocation
): string {
  const parts = [
    scanner,
    category,
    severity,
    title,
  ];

  // Include location if available (for file-specific findings)
  if (location) {
    parts.push(location.file);
    if (location.line !== undefined) {
      parts.push(String(location.line));
    }
  }

  const input = parts.join('|');
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

/**
 * Generate a content-based fingerprint
 * More stable across code changes
 */
export function generateContentFingerprint(
  scanner: string,
  category: string,
  content: string
): string {
  const input = `${scanner}|${category}|${content}`;
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

/**
 * Check if two findings are duplicates
 */
export function areDuplicates(f1: Finding, f2: Finding): boolean {
  return f1.fingerprint === f2.fingerprint;
}

/**
 * Deduplicate an array of findings
 */
export function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Map<string, Finding>();

  for (const finding of findings) {
    const existing = seen.get(finding.fingerprint);
    
    // Keep the finding with higher confidence if duplicate
    if (!existing || finding.confidence > existing.confidence) {
      seen.set(finding.fingerprint, finding);
    }
  }

  return Array.from(seen.values());
}
