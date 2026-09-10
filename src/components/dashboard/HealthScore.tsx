import { TrendingDown, TrendingUp, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface HealthScoreProps {
  score: number;
  trend: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export function HealthScore({
  score,
  trend,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
}: HealthScoreProps) {
  const getStatus = () => {
    if (score >= 80) return { label: 'HEALTHY', color: 'text-green-500' };
    if (score >= 60) return { label: 'NEEDS ATTENTION', color: 'text-yellow-500' };
    return { label: 'NEEDS TREATMENT', color: 'text-red-500' };
  };

  const status = getStatus();

  // Calculate circle properties
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-sm font-medium text-muted-foreground mb-6">
        REPOSITORY HEALTH
      </h3>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted/20"
            />
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold">{score}</div>
            <div className="text-muted-foreground text-sm">/ 100</div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center mb-6">
        <div className={`text-sm font-bold ${status.color}`}>
          {status.label}
        </div>
        {trend !== 0 && (
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span>{Math.abs(trend)} from previous scan</span>
          </div>
        )}
      </div>

      {/* Issue Breakdown */}
      <div className="space-y-2">
        {criticalCount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm">Critical</span>
            </div>
            <span className="text-sm font-medium">{criticalCount}</span>
          </div>
        )}
        {highCount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm">High</span>
            </div>
            <span className="text-sm font-medium">{highCount}</span>
          </div>
        )}
        {mediumCount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Medium</span>
            </div>
            <span className="text-sm font-medium">{mediumCount}</span>
          </div>
        )}
        {lowCount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Low</span>
            </div>
            <span className="text-sm font-medium">{lowCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
