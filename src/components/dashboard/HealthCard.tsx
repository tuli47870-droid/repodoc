import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Category } from '@/data/mockRepository';

interface HealthCardProps {
  name: Category;
  score: number;
  trend: number;
  status: string;
  onClick: () => void;
}

export function HealthCard({ name, score, trend, status, onClick }: HealthCardProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <button
      onClick={onClick}
      className="border rounded-lg p-4 text-left hover:border-primary/50 transition-all hover:shadow-md bg-card"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium">{name}</h3>
        <div className={`text-2xl font-bold ${getScoreColor()}`}>{score}</div>
      </div>

      <div className="space-y-2">
        {trend !== 0 && (
          <div className="flex items-center gap-1 text-sm">
            {trend > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500">+{trend}</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-red-500">{trend}</span>
              </>
            )}
            <span className="text-muted-foreground">from previous</span>
          </div>
        )}
        {trend === 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Minus className="w-4 h-4" />
            <span>No change</span>
          </div>
        )}
        <div className="text-sm text-muted-foreground">{status}</div>
      </div>
    </button>
  );
}
