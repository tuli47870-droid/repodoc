import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockRepository } from '@/data/mockRepository';
import { ArrowLeft, CheckCircle, X, GitPullRequest, Play } from 'lucide-react';
import { SeverityBadge } from '@/components/common/StatusBadge';

type VerificationStatus = 'pending' | 'running' | 'passed' | 'failed';

export function FixWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [showPRModal, setShowPRModal] = useState(false);

  const finding = mockRepository.findings.find((f) => f.id === id);

  if (!finding) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Finding not found</p>
      </div>
    );
  }

  const originalCode = `async function startPreview() {
  const container = await WebContainer.boot();
  await container.start();
  previewServer.attach(container);
  return container;
}`;

  const proposedCode = `// Abstraction layer for runtime providers
interface RuntimeProvider {
  start(): Promise<void>;
  stop(): Promise<void>;
  attach(server: PreviewServer): void;
}

class WebContainerProvider implements RuntimeProvider {
  private container?: WebContainer;
  
  async start() {
    this.container = await WebContainer.boot();
    await this.container.start();
  }
  
  attach(server: PreviewServer) {
    if (!this.container) throw new Error('Container not started');
    server.attach(this.container);
  }
  
  async stop() {
    await this.container?.stop();
  }
}

async function startPreview(provider: RuntimeProvider) {
  await provider.start();
  previewServer.attach(provider);
  return provider;
}`;

  const handleRunVerification = () => {
    setVerificationStatus('running');
    setTimeout(() => {
      setVerificationStatus('passed');
    }, 2000);
  };

  const handleApplyFix = () => {
    if (verificationStatus !== 'passed') {
      handleRunVerification();
      return;
    }
    setShowPRModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/findings/${finding.id}`)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Finding
        </button>

        <div className="flex items-start justify-between">
          <div>
            <SeverityBadge severity={finding.severity} className="mb-3" />
            <h1 className="text-3xl font-bold mb-2">Fix Workspace</h1>
            <p className="text-muted-foreground">{finding.title}</p>
          </div>
        </div>
      </div>

      {/* Strategy */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-3">Fix Strategy</h2>
        <p className="text-muted-foreground">{finding.recommendedFix}</p>
      </div>

      {/* Diff Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="px-4 py-2 bg-muted/50 border-b">
            <h3 className="text-sm font-medium">Original</h3>
            <code className="text-xs text-muted-foreground">src/runtime/container.ts</code>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="font-mono text-sm">
              {originalCode.split('\n').map((line, idx) => (
                <div key={idx} className="hover:bg-red-500/5">
                  <span className="text-muted-foreground select-none inline-block w-8 text-right mr-4">
                    {idx + 1}
                  </span>
                  <span className={idx >= 1 && idx <= 4 ? 'bg-red-500/10' : ''}>{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Proposed Fix */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="px-4 py-2 bg-muted/50 border-b">
            <h3 className="text-sm font-medium">Proposed Fix</h3>
            <code className="text-xs text-muted-foreground">src/runtime/preview-runtime.ts</code>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="font-mono text-sm">
              {proposedCode.split('\n').map((line, idx) => (
                <div key={idx} className="hover:bg-green-500/5">
                  <span className="text-muted-foreground select-none inline-block w-8 text-right mr-4">
                    {idx + 1}
                  </span>
                  <span className={line.includes('RuntimeProvider') || line.includes('class') ? 'bg-green-500/10' : ''}>
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Verification</h2>
          {verificationStatus === 'pending' && (
            <button
              onClick={handleRunVerification}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" />
              Run Verification
            </button>
          )}
        </div>

        <div className="space-y-3">
          <VerificationItem
            label="Build"
            status={verificationStatus}
          />
          <VerificationItem
            label="Tests"
            status={verificationStatus}
            details="196 passed"
          />
          <VerificationItem
            label="Preview"
            status={verificationStatus}
          />
          <VerificationItem
            label="Security"
            status={verificationStatus}
            details="No new issues"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleApplyFix}
          disabled={verificationStatus === 'running'}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          Apply Fix
        </button>
        <button
          onClick={() => setShowPRModal(true)}
          disabled={verificationStatus !== 'passed'}
          className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-md font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GitPullRequest className="w-5 h-5" />
          Create Pull Request
        </button>
        <button
          onClick={() => navigate(`/findings/${finding.id}`)}
          className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 rounded-md font-medium transition-colors"
        >
          <X className="w-5 h-5" />
          Reject
        </button>
      </div>

      {/* PR Modal */}
      {showPRModal && (
        <PRModal
          finding={finding}
          onClose={() => setShowPRModal(false)}
          onConfirm={() => {
            setShowPRModal(false);
            setTimeout(() => navigate('/dashboard'), 500);
          }}
        />
      )}
    </div>
  );
}

interface VerificationItemProps {
  label: string;
  status: VerificationStatus;
  details?: string;
}

function VerificationItem({ label, status, details }: VerificationItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {details && status === 'passed' && (
          <span className="text-sm text-muted-foreground">{details}</span>
        )}
        {status === 'pending' && <span className="text-sm text-muted-foreground">Not run</span>}
        {status === 'running' && (
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        )}
        {status === 'passed' && <CheckCircle className="w-5 h-5 text-green-500" />}
        {status === 'failed' && <X className="w-5 h-5 text-red-500" />}
      </div>
    </div>
  );
}

interface PRModalProps {
  finding: any;
  onClose: () => void;
  onConfirm: () => void;
}

function PRModal({ finding, onClose, onConfirm }: PRModalProps) {
  const [title, setTitle] = useState(`Fix: ${finding.title}`);
  const [description] = useState(`## Problem
${finding.description}

## Root Cause
${finding.rootCause}

## Changes
${finding.recommendedFix}

## Tests
✓ All tests passed
✓ Build successful
✓ Preview service operational

## Risk
Low - Changes are isolated to runtime abstraction layer`);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Create Pull Request</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
            <input
              type="text"
              value="repo-doctor/fix-preview-runtime"
              readOnly
              className="w-full px-3 py-2 bg-muted border rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border rounded-md text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              readOnly
              rows={12}
              className="w-full px-3 py-2 bg-muted/50 border rounded-md text-sm font-mono"
            />
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create Pull Request
          </button>
        </div>
      </div>
    </div>
  );
}
