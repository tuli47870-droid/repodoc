// API client for Repo Doctor backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || 'API request failed');
  }
  return response.json();
}

// Repository API
export interface Repository {
  id: string;
  provider: string;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createRepository(url: string): Promise<Repository> {
  const response = await fetch(`${API_BASE_URL}/api/repositories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return handleResponse<Repository>(response);
}

export async function getRepositories(): Promise<Repository[]> {
  const response = await fetch(`${API_BASE_URL}/api/repositories`);
  return handleResponse<Repository[]>(response);
}

export async function getRepository(id: string): Promise<Repository> {
  const response = await fetch(`${API_BASE_URL}/api/repositories/${id}`);
  return handleResponse<Repository>(response);
}

// Scan API
export interface Scan {
  id: string;
  repositoryId: string;
  commitSha: string | null;
  branch: string | null;
  status: string;
  currentStage: string | null;
  progress: number;
  progressMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  healthScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScanProgress {
  scanId: string;
  status: string;
  stage: string | null;
  progress: number;
  message: string | null;
}

export async function createScan(repositoryId: string, branch?: string): Promise<Scan> {
  const response = await fetch(`${API_BASE_URL}/api/scans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repositoryId, branch }),
  });
  return handleResponse<Scan>(response);
}

export async function getScan(id: string): Promise<Scan> {
  const response = await fetch(`${API_BASE_URL}/api/scans/${id}`);
  return handleResponse<Scan>(response);
}

export async function getScanProgress(id: string): Promise<ScanProgress> {
  const response = await fetch(`${API_BASE_URL}/api/scans/${id}/progress`);
  return handleResponse<ScanProgress>(response);
}

// Health check
export interface HealthCheck {
  status: string;
  service: string;
  database: string;
  redis: string;
  timestamp: string;
}

export async function checkHealth(): Promise<HealthCheck> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<HealthCheck>(response);
}
