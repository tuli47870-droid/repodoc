import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`h-4 bg-muted rounded animate-pulse ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <SkeletonLine className="w-1/4" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-3/4" />
    </div>
  );
}
