export type ScanStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type ScanStage = 
  | 'QUEUED'
  | 'CLONING'
  | 'MAPPING'
  | 'READY'
  | 'FAILED';

export type ArtifactType = 
  | 'REPOSITORY_MANIFEST';

export interface RepositoryManifest {
  repository: {
    provider: string;
    owner: string;
    name: string;
    fullName: string;
    url: string;
  };
  commit: string;
  branch: string;
  fileCount: number;
  totalSizeBytes: number;
  languages: string[];
  frameworks: string[];
  packageManagers: string[];
  entryPoints: string[];
  directories: string[];
  files: FileInfo[];
}

export interface FileInfo {
  path: string;
  size: number;
  type: string;
}

export interface ScanProgress {
  scanId: string;
  status: ScanStatus;
  stage: ScanStage;
  progress: number;
  message: string;
}
