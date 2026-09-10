import { mockRuntimeServices } from '@/data/mockRepository';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const mockMetrics = [
  { time: '10:30', cpu: 45, memory: 62, requests: 120 },
  { time: '10:35', cpu: 52, memory: 65, requests: 145 },
  { time: '10:40', cpu: 48, memory: 64, requests: 132 },
  { time: '10:45', cpu: 55, memory: 68, requests: 156 },
  { time: '10:50', cpu: 51, memory: 66, requests: 140 },
];

export function RuntimePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Runtime</h1>
        <p className="text-muted-foreground">Application runtime monitoring</p>
      </div>

      {/* Status Overview */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Application Status: Degraded</h2>
            <p className="text-sm text-muted-foreground">1 service failed, 1 degraded</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Services</h2>
        <div className="space-y-3">
          {mockRuntimeServices.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {service.status === 'healthy' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {service.status === 'degraded' && (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                {service.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {service.uptime && (
                  <span className="text-sm text-muted-foreground">{service.uptime}</span>
                )}
                <span
                  className={`text-sm ${
                    service.status === 'healthy'
                      ? 'text-green-500'
                      : service.status === 'degraded'
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  }`}
                >
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard title="CPU Usage" value="51%" data={mockMetrics} dataKey="cpu" color="#3b82f6" />
        <MetricCard title="Memory" value="66%" data={mockMetrics} dataKey="memory" color="#10b981" />
        <MetricCard title="Requests/min" value="140" data={mockMetrics} dataKey="requests" color="#f59e0b" />
      </div>

      {/* Error Count */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-3">Recent Errors</h2>
        <div className="space-y-2">
          <ErrorItem
            timestamp="10:42:35"
            message="Preview service failed to start"
            count={12}
          />
          <ErrorItem
            timestamp="10:38:21"
            message="WebSocket connection timeout"
            count={3}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  data,
  dataKey,
  color,
}: {
  title: string;
  value: string;
  data: any[];
  dataKey: string;
  color: string;
}) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ErrorItem({
  timestamp,
  message,
  count,
}: {
  timestamp: string;
  message: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <div>
          <span className="text-sm font-medium">{message}</span>
          <div className="text-xs text-muted-foreground">{timestamp}</div>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">×{count}</span>
    </div>
  );
}
