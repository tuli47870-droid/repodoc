import { useParams, useNavigate } from 'react-router-dom';
import { mockRepository } from '@/data/mockRepository';
import { SeverityBadge } from '@/components/common/StatusBadge';
import { CodeViewer } from '@/components/common/CodeViewer';
import { ArrowLeft, CheckCircle, AlertTriangle, Wrench, EyeOff } from 'lucide-react';

export function FindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const finding = mockRepository.findings.find((f) => f.id === id);

  if (!finding) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Finding not found</p>
        <button
          onClick={() => navigate('/findings')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Findings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/findings')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Findings
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <SeverityBadge severity={finding.severity} />
              <span className="text-sm text-muted-foreground">
                Confidence: {finding.confidence}%
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{finding.title}</h1>
            <p className="text-muted-foreground">{finding.description}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/fix/${finding.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Wrench className="w-4 h-4" />
              Generate Fix
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-md text-sm font-medium hover:bg-green-500/20 transition-colors">
              <CheckCircle className="w-4 h-4" />
              Mark Resolved
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition-colors">
              <EyeOff className="w-4 h-4" />
              Ignore
            </button>
          </div>
        </div>
      </div>

      {/* Why This Happens */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Why This Happens
        </h2>
        <p className="text-muted-foreground">{finding.description}</p>
      </div>

      {/* Root Cause */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Root Cause</h2>
        <p className="text-muted-foreground mb-6">{finding.rootCause}</p>

        {/* Dependency Diagram */}
        {finding.id === '1' && (
          <div className="border rounded-lg p-6 bg-muted/30">
            <div className="flex flex-col items-center gap-4">
              <DependencyNode label="Preview UI" />
              <Arrow />
              <DependencyNode label="Preview Runtime" />
              <Arrow />
              <DependencyNode label="WebContainer Lifecycle" highlight />
              <Arrow />
              <DependencyNode label="Preview Server" />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              The problematic dependency is highlighted
            </p>
          </div>
        )}
      </div>

      {/* Impact */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-3">Impact</h2>
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm">{finding.impact}</p>
        </div>
      </div>

      {/* Evidence */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Evidence</h2>
        {finding.evidence.map((evidence, idx) => (
          <div key={idx} className="space-y-2">
            <CodeViewer
              file={evidence.file}
              line={evidence.line}
              code={evidence.code}
              highlightLines={[evidence.line]}
            />
            <p className="text-sm text-muted-foreground ml-4">{evidence.explanation}</p>
          </div>
        ))}
      </div>

      {/* Reproduction Steps */}
      {finding.reproduction && (
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Reproduction</h2>
            <span className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle className="w-4 h-4" />
              Reproduced ✓
            </span>
          </div>
          <ol className="space-y-2">
            {finding.reproduction.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
                  {idx + 1}
                </span>
                <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Recommended Fix */}
      {finding.recommendedFix && (
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-3">Recommended Fix</h2>
          <p className="text-muted-foreground mb-4">{finding.recommendedFix}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/fix/${finding.id}`)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Generate Patch
            </button>
            <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition-colors">
              View Proposed Architecture
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DependencyNode({ label, highlight = false }: { label: string; highlight?: boolean }) {
  return (
    <div
      className={`px-6 py-3 rounded-lg border-2 text-sm font-medium ${
        highlight
          ? 'bg-red-500/10 border-red-500 text-red-500'
          : 'bg-card border-border'
      }`}
    >
      {label}
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-6 bg-border" />
      <div className="w-2 h-2 border-r-2 border-b-2 border-border rotate-45 -mt-1" />
    </div>
  );
}
