import { mockRepository, mockDependencies } from '@/data/mockRepository';
import { Shield, AlertTriangle, AlertCircle, Lock, Key } from 'lucide-react';
import { SeverityBadge } from '@/components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';

export function SecurityPage() {
  const navigate = useNavigate();
  const securityFindings = mockRepository.findings.filter((f) => f.category === 'Security');
  const vulnerableDeps = mockDependencies.filter((d) => d.status === 'vulnerable');

  const criticalCount = securityFindings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = securityFindings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = securityFindings.filter((f) => f.severity === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Security</h1>
        <p className="text-muted-foreground">
          {securityFindings.length} vulnerabilities require attention
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Critical</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold">{criticalCount}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">High</span>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold">{highCount}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Medium</span>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold">{mediumCount}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Score</span>
            <Shield className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold">81</div>
        </div>
      </div>

      {/* Vulnerable Dependencies */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Vulnerable Dependencies</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Package</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Current</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Recommended</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vulnerableDeps.map((dep) => (
                <tr key={dep.name} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <code className="text-sm font-mono">{dep.name}</code>
                  </td>
                  <td className="px-4 py-3 text-sm">{dep.current}</td>
                  <td className="px-4 py-3 text-sm text-green-500">{dep.recommended}</td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={dep.severity!} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Findings */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Security Findings</h2>
        <div className="space-y-3">
          {securityFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => navigate(`/findings/${finding.id}`)}
              className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <SeverityBadge severity={finding.severity} />
                  </div>
                  <h3 className="font-medium mb-1">{finding.title}</h3>
                  <p className="text-sm text-muted-foreground">{finding.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Key, label: 'Authentication', status: 'Issues Found', color: 'text-orange-500' },
          { icon: Lock, label: 'Authorization', status: 'Healthy', color: 'text-green-500' },
          { icon: Shield, label: 'Data Protection', status: 'Healthy', color: 'text-green-500' },
          { icon: AlertTriangle, label: 'Rate Limiting', status: 'Not Configured', color: 'text-yellow-500' },
        ].map((cat) => (
          <div key={cat.label} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3">
              <cat.icon className={`w-5 h-5 ${cat.color}`} />
              <div className="flex-1">
                <h3 className="font-medium">{cat.label}</h3>
                <p className={`text-sm ${cat.color}`}>{cat.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
