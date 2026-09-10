import { cn } from '@/lib/utils';
import { Severity, Status } from '@/data/mockRepository';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<Status, string> = {
    OPEN: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    INVESTIGATING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    FIXED: 'bg-green-500/10 text-green-500 border-green-500/20',
    VERIFIED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    IGNORED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        variants[status],
        className
      )}
    >
      {status}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const variants: Record<Severity, string> = {
    CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
    HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    LOW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    INFO: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase',
        variants[severity],
        className
      )}
    >
      {severity}
    </span>
  );
}
