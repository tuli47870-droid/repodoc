import { mockTestResults } from '@/data/mockRepository';
import { TestTube, CheckCircle, XCircle, Circle } from 'lucide-react';

export function TestsPage() {
  const passed = mockTestResults.filter((t) => t.status === 'passed').length;
  const failed = mockTestResults.filter((t) => t.status === 'failed').length;
  const skipped = mockTestResults.filter((t) => t.status === 'skipped').length;
  const coverage = 47;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tests</h1>
        <p className="text-muted-foreground">Test results and coverage</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Passing</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold">{passed}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Failing</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold">{failed}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Skipped</span>
            <Circle className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold">{skipped}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Coverage</span>
            <TestTube className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold">{coverage}%</div>
        </div>
      </div>

      {/* Coverage Bar */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Code Coverage</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Coverage</span>
            <span className="font-medium">{coverage}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${coverage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Below recommended minimum of 80%
          </p>
        </div>
      </div>

      {/* Test Results */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Test Results</h2>
        <div className="space-y-2">
          {mockTestResults.map((test, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {test.status === 'passed' && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              {test.status === 'failed' && (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              {test.status === 'skipped' && (
                <Circle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{test.name}</span>
                  {test.duration && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {test.duration}
                    </span>
                  )}
                </div>
                {test.error && (
                  <p className="text-sm text-red-500 mt-1">{test.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
