import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface ScanStage {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending';
}

interface ActivityLog {
  timestamp: string;
  message: string;
}

export function ScanProgressPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const stages: ScanStage[] = [
    { id: '1', name: 'Repository mapped', status: 'completed' },
    { id: '2', name: 'Dependencies analyzed', status: 'completed' },
    { id: '3', name: 'Security scan', status: 'completed' },
    { id: '4', name: 'Build analysis', status: 'completed' },
    { id: '5', name: 'Tests executed', status: 'completed' },
    { id: '6', name: 'Architecture analysis', status: 'active' },
    { id: '7', name: 'Root cause analysis', status: 'pending' },
    { id: '8', name: 'Final diagnosis', status: 'pending' },
  ];

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => navigate('/dashboard'), 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Simulate stage progression
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= stages.length - 1) {
          clearInterval(stageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    // Simulate logs
    const initialLogs: ActivityLog[] = [
      { timestamp: '10:41:02', message: 'Repository indexed' },
      { timestamp: '10:41:18', message: '184 dependencies detected' },
      { timestamp: '10:41:42', message: 'Security analysis completed' },
      { timestamp: '10:42:01', message: '3 critical findings detected' },
    ];

    setLogs(initialLogs);

    const logInterval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            }),
            message: [
              'Analyzing architecture...',
              'Checking circular dependencies...',
              'Evaluating code complexity...',
              'Scanning for vulnerabilities...',
            ][Math.floor(Math.random() * 4)],
          },
        ];
        return newLogs.slice(-8); // Keep last 8 logs
      });
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(logInterval);
    };
  }, [navigate]);

  const getStageStatus = (index: number): ScanStage['status'] => {
    if (index < currentStage) return 'completed';
    if (index === currentStage) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Diagnosing repository...</h1>
        <p className="text-muted-foreground">
          Analyzing code, dependencies, and architecture
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-6">Scan Stages</h2>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            return (
              <div key={stage.id} className="flex items-center gap-3">
                {status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {status === 'active' && (
                  <Loader2 className="w-5 h-5 text-primary flex-shrink-0 animate-spin" />
                )}
                {status === 'pending' && (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    status === 'completed'
                      ? 'text-foreground'
                      : status === 'active'
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stage.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Log */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
        <div className="space-y-2 font-mono text-sm">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="text-muted-foreground">{log.timestamp}</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <p className="text-center text-sm text-muted-foreground">
        This diagnostic pipeline typically takes 30-60 seconds
      </p>
    </div>
  );
}
