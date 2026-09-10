import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockRepository } from '@/data/mockRepository';

export function HealthTrend() {
  const data = mockRepository.scanHistory.map((scan) => ({
    name: scan.date,
    score: scan.score,
  })).reverse();

  return (
    <div className="border rounded-lg p-6 bg-card h-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        HEALTH TREND
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            domain={[0, 100]} 
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
