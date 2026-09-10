import { mockDependencies } from '@/data/mockRepository';
import { Package, AlertTriangle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { SeverityBadge } from '@/components/common/StatusBadge';

export function DependenciesPage() {
  const total = mockDependencies.length;
  const outdated = mockDependencies.filter((d) => d.status === 'outdated').length;
  const vulnerable = mockDependencies.filter((d) => d.status === 'vulnerable').length;
  const unused = mockDependencies.filter((d) => d.status === 'unused').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dependencies</h1>
        <p className="text-muted-foreground">Dependency analysis and recommendations</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total</span>
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{total}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Outdated</span>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold">{outdated}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Vulnerable</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold">{vulnerable}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Unused</span>
            <XCircle className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold">{unused}</div>
        </div>
      </div>

      {/* Dependencies Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Package</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Current</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Recommended</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockDependencies.map((dep) => (
                <tr key={dep.name} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <code className="text-sm font-mono">{dep.name}</code>
                  </td>
                  <td className="px-4 py-3 text-sm">{dep.current}</td>
                  <td className="px-4 py-3 text-sm">
                    {dep.recommended ? (
                      <span className="text-green-500">{dep.recommended}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {dep.status === 'current' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Current</span>
                        </>
                      )}
                      {dep.status === 'outdated' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Outdated</span>
                        </>
                      )}
                      {dep.status === 'vulnerable' && (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm">Vulnerable</span>
                        </>
                      )}
                      {dep.status === 'unused' && (
                        <>
                          <XCircle className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Unused</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {dep.severity ? <SeverityBadge severity={dep.severity} /> : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dependency Relationship Visualization */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Dependency Relationships</h2>
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="text-center">
            <div className="px-6 py-3 bg-primary/10 border border-primary/50 rounded-lg font-medium mb-2">
              Application
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="text-center">
              <div className="px-4 py-2 bg-card border rounded-lg text-sm">
                <div className="font-medium">React</div>
                <div className="text-xs text-muted-foreground">18.2.0</div>
              </div>
            </div>
            <div className="text-center">
              <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm">
                <div className="font-medium">Lodash</div>
                <div className="text-xs text-red-500">4.17.19 (vulnerable)</div>
              </div>
            </div>
            <div className="text-center">
              <div className="px-4 py-2 bg-card border rounded-lg text-sm">
                <div className="font-medium">TypeScript</div>
                <div className="text-xs text-muted-foreground">5.3.2</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Showing direct dependencies only
          </p>
        </div>
      </div>
    </div>
  );
}
