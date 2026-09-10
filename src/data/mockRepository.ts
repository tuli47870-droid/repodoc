export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type Status = 'OPEN' | 'INVESTIGATING' | 'FIXED' | 'VERIFIED' | 'IGNORED';
export type Category = 'Security' | 'Architecture' | 'Build' | 'Tests' | 'Dependencies' | 'Runtime' | 'Maintainability' | 'Documentation';

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  category: Category;
  file: string;
  confidence: number;
  status: Status;
  description: string;
  rootCause: string;
  impact: string;
  evidence: Evidence[];
  reproduction?: string[];
  recommendedFix?: string;
}

export interface Evidence {
  file: string;
  line: number;
  code: string;
  explanation: string;
}

export interface HealthScore {
  overall: number;
  trend: number;
  categories: {
    name: Category;
    score: number;
    trend: number;
    status: string;
  }[];
}

export interface Repository {
  name: string;
  branch: string;
  lastScan: string;
  health: HealthScore;
  findings: Finding[];
  scanHistory: ScanHistoryItem[];
}

export interface ScanHistoryItem {
  id: number;
  date: string;
  timestamp: string;
  score: number;
  findings: number;
}

export interface DependencyItem {
  name: string;
  current: string;
  recommended?: string;
  severity?: Severity;
  status: 'current' | 'outdated' | 'vulnerable' | 'unused';
}

export interface BuildLog {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration?: string;
  error?: string;
}

export interface RuntimeService {
  name: string;
  status: 'healthy' | 'degraded' | 'failed';
  uptime?: string;
}

// Mock data
export const mockRepository: Repository = {
  name: 'we0',
  branch: 'main',
  lastScan: 'Today, 10:42 AM',
  health: {
    overall: 64,
    trend: -3,
    categories: [
      { name: 'Security', score: 81, trend: 6, status: 'Healthy' },
      { name: 'Architecture', score: 72, trend: -2, status: 'Needs attention' },
      { name: 'Build', score: 92, trend: 0, status: 'Healthy' },
      { name: 'Tests', score: 47, trend: -4, status: 'Needs treatment' },
      { name: 'Dependencies', score: 43, trend: -8, status: 'Critical' },
      { name: 'Runtime', score: 74, trend: 3, status: 'Healthy' },
      { name: 'Maintainability', score: 57, trend: 1, status: 'Needs attention' },
      { name: 'Documentation', score: 61, trend: 0, status: 'Needs attention' },
    ],
  },
  findings: [
    {
      id: '1',
      severity: 'CRITICAL',
      title: 'Preview system fails without WebContainer',
      category: 'Architecture',
      file: 'src/runtime/container.ts',
      confidence: 96,
      status: 'OPEN',
      description: 'The preview service is tightly coupled to the WebContainer runtime, causing complete failure when WebContainer is unavailable.',
      rootCause: 'The preview service assumes that WebContainer is responsible for starting and maintaining the runtime. This creates a hard dependency that prevents the preview system from operating independently.',
      impact: 'Removing WebContainer prevents the preview service from starting, blocking all preview functionality for users.',
      evidence: [
        {
          file: 'src/runtime/container.ts',
          line: 41,
          code: `async function startPreview() {
  const container = await WebContainer.boot();
  await container.start();
  previewServer.attach(container);
  return container;
}`,
          explanation: 'Preview lifecycle is directly tied to WebContainer instantiation',
        },
        {
          file: 'src/preview/server.ts',
          line: 82,
          code: `export class PreviewServer {
  constructor(private container: WebContainer) {
    this.container.on('server-ready', () => {
      this.emit('ready');
    });
  }
}`,
          explanation: 'PreviewServer constructor requires WebContainer instance',
        },
      ],
      reproduction: [
        'Start application',
        'Remove WebContainer runtime',
        'Attempt to start preview',
        'Preview fails with "Cannot read property \'start\' of undefined"',
      ],
      recommendedFix: 'Decouple preview lifecycle from WebContainer by introducing an abstraction layer for runtime providers.',
    },
    {
      id: '2',
      severity: 'HIGH',
      title: 'Authentication logic duplicated across 4 modules',
      category: 'Architecture',
      file: 'src/auth/*',
      confidence: 91,
      status: 'OPEN',
      description: 'Authentication validation code is duplicated in multiple modules, creating maintenance burden and potential security inconsistencies.',
      rootCause: 'No centralized authentication service exists. Each module implements its own validation logic.',
      impact: 'Security updates must be applied in multiple places. Risk of inconsistent authentication behavior across the application.',
      evidence: [
        {
          file: 'src/auth/api-auth.ts',
          line: 15,
          code: `function validateToken(token: string) {
  if (!token) return false;
  return jwt.verify(token, SECRET_KEY);
}`,
          explanation: 'Token validation in API module',
        },
        {
          file: 'src/auth/ws-auth.ts',
          line: 23,
          code: `function checkAuth(token: string) {
  if (!token) return false;
  return jwt.verify(token, SECRET_KEY);
}`,
          explanation: 'Duplicate validation logic in WebSocket module',
        },
      ],
      recommendedFix: 'Create a shared AuthService class that all modules can import.',
    },
    {
      id: '3',
      severity: 'HIGH',
      title: 'Vulnerable dependency detected: lodash@4.17.19',
      category: 'Security',
      file: 'package.json',
      confidence: 99,
      status: 'OPEN',
      description: 'Using outdated version of lodash with known prototype pollution vulnerability (CVE-2021-23337).',
      rootCause: 'Dependencies have not been updated in 8 months.',
      impact: 'Potential for prototype pollution attacks that could lead to arbitrary code execution.',
      evidence: [
        {
          file: 'package.json',
          line: 24,
          code: `"dependencies": {
  "lodash": "4.17.19",
  "express": "^4.18.0"
}`,
          explanation: 'Outdated lodash version with known security vulnerability',
        },
      ],
      recommendedFix: 'Update lodash to version 4.17.21 or higher.',
    },
    {
      id: '4',
      severity: 'HIGH',
      title: 'Circular dependency detected',
      category: 'Architecture',
      file: 'src/services/payment.ts',
      confidence: 88,
      status: 'OPEN',
      description: 'Circular import between payment service and user service causes initialization issues.',
      rootCause: 'Payment service imports User, User imports PaymentHistory, PaymentHistory imports PaymentService.',
      impact: 'Potential runtime errors and unpredictable initialization order.',
      evidence: [],
      recommendedFix: 'Break the circular dependency by introducing a shared types module.',
    },
    {
      id: '5',
      severity: 'MEDIUM',
      title: 'Missing error boundaries in React components',
      category: 'Runtime',
      file: 'src/components/*',
      confidence: 85,
      status: 'OPEN',
      description: 'No error boundaries implemented, causing full app crashes on component errors.',
      rootCause: 'Error boundaries were not included in initial architecture.',
      impact: 'Single component error can crash entire application.',
      evidence: [],
      recommendedFix: 'Implement error boundary components at key application boundaries.',
    },
    {
      id: '6',
      severity: 'MEDIUM',
      title: 'API endpoints lack rate limiting',
      category: 'Security',
      file: 'src/api/server.ts',
      confidence: 92,
      status: 'OPEN',
      description: 'No rate limiting configured on public API endpoints.',
      rootCause: 'Rate limiting was not implemented during initial development.',
      impact: 'API vulnerable to abuse and denial-of-service attacks.',
      evidence: [],
      recommendedFix: 'Implement rate limiting middleware using express-rate-limit.',
    },
  ],
  scanHistory: [
    { id: 184, date: 'Today', timestamp: '10:42 AM', score: 64, findings: 47 },
    { id: 183, date: 'Yesterday', timestamp: '3:21 PM', score: 61, findings: 43 },
    { id: 182, date: 'Sep 8', timestamp: '11:15 AM', score: 58, findings: 45 },
    { id: 181, date: 'Sep 7', timestamp: '2:33 PM', score: 62, findings: 41 },
    { id: 180, date: 'Sep 6', timestamp: '9:44 AM', score: 59, findings: 44 },
  ],
};

export const mockDependencies: DependencyItem[] = [
  { name: 'lodash', current: '4.17.19', recommended: '4.17.21', severity: 'HIGH', status: 'vulnerable' },
  { name: 'axios', current: '0.21.1', recommended: '1.6.0', severity: 'HIGH', status: 'vulnerable' },
  { name: 'react', current: '18.2.0', recommended: '18.3.1', status: 'outdated' },
  { name: 'express', current: '4.18.0', status: 'current' },
  { name: 'typescript', current: '5.3.2', status: 'current' },
  { name: 'moment', current: '2.29.4', status: 'unused' },
];

export const mockBuildLogs: BuildLog[] = [
  { timestamp: '10:42:01', message: '$ npm run build', type: 'info' },
  { timestamp: '10:42:02', message: 'Installing dependencies...', type: 'info' },
  { timestamp: '10:42:18', message: '✓ Dependencies installed', type: 'success' },
  { timestamp: '10:42:19', message: 'Type checking...', type: 'info' },
  { timestamp: '10:42:24', message: '✓ Type checking passed', type: 'success' },
  { timestamp: '10:42:25', message: 'Compiling...', type: 'info' },
  { timestamp: '10:42:31', message: '✓ Compilation complete', type: 'success' },
  { timestamp: '10:42:32', message: 'Running production build...', type: 'info' },
  { timestamp: '10:42:35', message: 'ERROR: Module dependency unavailable', type: 'error' },
  { timestamp: '10:42:35', message: 'src/runtime/container.ts:41', type: 'error' },
  { timestamp: '10:42:35', message: 'Cannot find module "webcontainer"', type: 'error' },
  { timestamp: '10:42:35', message: 'Build failed with exit code 1', type: 'error' },
];

export const mockTestResults: TestResult[] = [
  { name: 'Authentication: login with valid credentials', status: 'passed', duration: '42ms' },
  { name: 'Authentication: login with invalid credentials', status: 'passed', duration: '38ms' },
  { name: 'API: health check endpoint', status: 'passed', duration: '12ms' },
  { name: 'API: user creation', status: 'passed', duration: '156ms' },
  { name: 'Preview: runtime initialization', status: 'failed', error: 'WebContainer is not defined', duration: '8ms' },
  { name: 'Preview: server startup', status: 'failed', error: 'Cannot start preview server', duration: '5ms' },
  { name: 'Payment: process payment callback', status: 'failed', error: 'Circular dependency detected', duration: '2ms' },
  { name: 'Database: connection pool', status: 'passed', duration: '234ms' },
  { name: 'Database: migration status', status: 'passed', duration: '89ms' },
  { name: 'Security: CSRF protection', status: 'passed', duration: '23ms' },
  { name: 'Security: XSS sanitization', status: 'passed', duration: '19ms' },
  { name: 'Integration: end-to-end user flow', status: 'skipped' },
];

export const mockRuntimeServices: RuntimeService[] = [
  { name: 'API Server', status: 'healthy', uptime: '5d 12h' },
  { name: 'Database', status: 'healthy', uptime: '5d 12h' },
  { name: 'Preview Service', status: 'failed', uptime: '0h' },
  { name: 'Worker Queue', status: 'healthy', uptime: '5d 11h' },
  { name: 'Cache', status: 'healthy', uptime: '5d 12h' },
  { name: 'WebSocket', status: 'degraded', uptime: '2h 34m' },
];

export const mockArchitectureNodes = [
  { id: 'frontend', name: 'Frontend', modules: 18, status: 'healthy' },
  { id: 'api', name: 'API Layer', modules: 24, status: 'healthy' },
  { id: 'services', name: 'Services', modules: 12, status: 'degraded' },
  { id: 'database', name: 'Database', modules: 8, status: 'healthy' },
];

export const mockArchitectureIssues = [
  { severity: 'CRITICAL' as const, title: 'Tightly coupled runtime', affected: ['preview', 'container'] },
  { severity: 'HIGH' as const, title: 'Circular dependency', affected: ['payment', 'user'] },
  { severity: 'MEDIUM' as const, title: 'Large service boundary', affected: ['services'] },
];
