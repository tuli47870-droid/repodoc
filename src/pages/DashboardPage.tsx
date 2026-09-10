import { useNavigate } from 'react-router-dom';
import { mockRepository } from '@/data/mockRepository';
import { HealthScore } from '@/components/dashboard/HealthScore';
import { HealthCard } from '@/components/dashboard/HealthCard';
import { TopProblems } from '@/components/dashboard/TopProblems';
import { HealthTrend } from '@/components/dashboard/HealthTrend';

export function DashboardPage() {
  const navigate = useNavigate();
  const { health, findings } = mockRepository;

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter((f) => f.severity === 'LOW').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Repository Health</h1>
        <p className="text-muted-foreground">
          Last scan: {mockRepository.lastScan}
        </p>
      </div>

      {/* Health Score and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HealthScore
            score={health.overall}
            trend={health.trend}
            criticalCount={criticalCount}
            highCount={highCount}
            mediumCount={mediumCount}
            lowCount={lowCount}
          />
        </div>
        <div className="lg:col-span-2">
          <HealthTrend />
        </div>
      </div>

      {/* Category Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Health by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {health.categories.map((category) => (
            <HealthCard
              key={category.name}
              name={category.name}
              score={category.score}
              trend={category.trend}
              status={category.status}
              onClick={() => navigate(`/${category.name.toLowerCase()}`)}
            />
          ))}
        </div>
      </div>

      {/* Top Problems */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Problems</h2>
        <TopProblems findings={findings.slice(0, 5)} />
      </div>
    </div>
  );
}
