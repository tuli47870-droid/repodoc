import { useNavigate } from 'react-router-dom';
import { Finding } from '@/data/mockRepository';
import { SeverityBadge } from '@/components/common/StatusBadge';
import { ArrowRight, FileCode } from 'lucide-react';

interface TopProblemsProps {
  findings: Finding[];
}

export function TopProblems({ findings }: TopProblemsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {findings.map((finding) => (
        <div
          key={finding.id}
          className="border rounded-lg p-4 hover:border-primary/50 transition-all hover:shadow-md bg-card cursor-pointer"
          onClick={() => navigate(`/findings/${finding.id}`)}
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <SeverityBadge severity={finding.severity} />
                <span className="text-xs text-muted-foreground">
                  Confidence: {finding.confidence}%
                </span>
              </div>

              <h3 className="font-semibold mb-2">{finding.title}</h3>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Root Cause: </span>
                  <span>{finding.rootCause}</span>
                </div>

                {finding.evidence.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileCode className="w-4 h-4" />
                    <span>Evidence:</span>
                    {finding.evidence.slice(0, 2).map((ev, idx) => (
                      <code key={idx} className="text-xs">
                        {ev.file}:{ev.line}
                      </code>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/findings/${finding.id}`);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  View Evidence
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/fix/${finding.id}`);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Generate Fix
                </button>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
