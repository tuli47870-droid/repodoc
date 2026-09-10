import { mockBuildLogs } from '@/data/mockRepository';
import { Hammer, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export function BuildPage() {
  const passed = mockBuildLogs.filter((l) => l.type === 'success').length;
  const failed = mockBuildLogs.filter((l) => l.type === 'error').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Build</h1>
        <p className="text-muted-foreground">Build status and logs</p>
      </div>

      {/* Build Status */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Build Failed</h2>
              <p className="text-sm text-muted-foreground">Last run: Today at 10:42 AM</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              <RotateCcw className="w-4 h-4" />
              Retry Build
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Duration</div>
            <div className="font-medium">34s</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Steps Passed</div>
            <div className="font-medium text-green-500">{passed}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Steps Failed</div>
            <div className="font-medium text-red-500">{failed}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Exit Code</div>
            <div className="font-medium">1</div>
          </div>
        </div>
      </div>

      {/* Build Steps */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Build Steps</h2>
        <div className="space-y-3">
          <BuildStep
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            label="Dependencies installed"
            status="passed"
          />
          <BuildStep
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            label="Type checking"
            status="passed"
          />
          <BuildStep
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            label="Compilation"
            status="passed"
          />
          <BuildStep
            icon={<XCircle className="w-5 h-5 text-red-500" />}
            label="Production build"
            status="failed"
          />
        </div>
      </div>

      {/* Terminal Output */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Terminal Output</h2>
          <Hammer className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="p-4 bg-black text-green-400 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
          {mockBuildLogs.map((log, idx) => (
            <div
              key={idx}
              className={
                log.type === 'error'
                  ? 'text-red-400'
                  : log.type === 'success'
                  ? 'text-green-400'
                  : 'text-gray-300'
              }
            >
              {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* Error Details */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-3">Error Details</h2>
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Module dependency unavailable</h3>
              <code className="text-sm">src/runtime/container.ts:41</code>
              <p className="text-sm text-muted-foreground mt-2">
                Cannot find module "webcontainer"
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="text-sm text-primary hover:underline">View Error</button>
          <button className="text-sm text-primary hover:underline">Ask Doctor</button>
        </div>
      </div>
    </div>
  );
}

function BuildStep({
  icon,
  label,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  status: 'passed' | 'failed';
}) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      {icon}
      <span className="flex-1 font-medium">{label}</span>
      <span className={`text-sm ${status === 'passed' ? 'text-green-500' : 'text-red-500'}`}>
        {status === 'passed' ? 'Passed' : 'Failed'}
      </span>
    </div>
  );
}
