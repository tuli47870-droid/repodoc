import { mockArchitectureNodes, mockArchitectureIssues } from '@/data/mockRepository';
import { Network, AlertTriangle } from 'lucide-react';
import { SeverityBadge } from '@/components/common/StatusBadge';

export function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Architecture</h1>
        <p className="text-muted-foreground">
          Repository structure and dependency relationships
        </p>
      </div>

      {/* Health Score */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              ARCHITECTURE HEALTH
            </h3>
            <div className="text-4xl font-bold text-yellow-500">72/100</div>
          </div>
          <Network className="w-12 h-12 text-muted-foreground" />
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="border rounded-lg p-8 bg-card">
        <h2 className="text-lg font-semibold mb-6">System Architecture</h2>
        <div className="flex flex-col items-center gap-6">
          {mockArchitectureNodes.map((node, idx) => (
            <div key={node.id}>
              <div
                className={`px-8 py-4 rounded-lg border-2 text-center min-w-[200px] ${
                  node.status === 'healthy'
                    ? 'bg-green-500/10 border-green-500/50'
                    : node.status === 'degraded'
                    ? 'bg-yellow-500/10 border-yellow-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}
              >
                <h3 className="font-semibold mb-1">{node.name}</h3>
                <p className="text-sm text-muted-foreground">{node.modules} modules</p>
              </div>
              {idx < mockArchitectureNodes.length - 1 && (
                <div className="flex flex-col items-center my-2">
                  <div className="w-0.5 h-8 bg-border" />
                  <div className="w-3 h-3 border-r-2 border-b-2 border-border rotate-45 -mt-1" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Issues */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Architecture Problems</h2>
        <div className="space-y-3">
          {mockArchitectureIssues.map((issue, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge severity={issue.severity} />
                  </div>
                  <h3 className="font-medium mb-1">{issue.title}</h3>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>Affected:</span>
                    {issue.affected.map((module) => (
                      <code key={module} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {module}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground mb-1">Coupling</div>
          <div className="text-2xl font-bold">Medium</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground mb-1">Cohesion</div>
          <div className="text-2xl font-bold">High</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground mb-1">Complexity</div>
          <div className="text-2xl font-bold">Moderate</div>
        </div>
      </div>
    </div>
  );
}
