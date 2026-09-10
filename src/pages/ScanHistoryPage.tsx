import { mockRepository } from '@/data/mockRepository';
import { useNavigate } from 'react-router-dom';
import { History, TrendingDown, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ScanHistoryPage() {
  const navigate = useNavigate();

  const chartData = mockRepository.scanHistory.map((scan) => ({
    name: scan.date,
    score: scan.score,
  })).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Scan History</h1>
        <p className="text-muted-foreground">
          {mockRepository.scanHistory.length} scans completed
        </p>
      </div>

      {/* Trend Chart */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-6">Health Score Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
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

      {/* Scan List */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Scan #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Health Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Findings</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockRepository.scanHistory.map((scan, idx) => {
                const prevScan = mockRepository.scanHistory[idx + 1];
                const trend = prevScan ? scan.score - prevScan.score : 0;

                return (
                  <tr
                    key={scan.id}
                    onClick={() => navigate('/dashboard')}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">#{scan.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{scan.date}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{scan.timestamp}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          scan.score >= 80
                            ? 'text-green-500'
                            : scan.score >= 60
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}
                      >
                        {scan.score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{scan.findings}</td>
                    <td className="px-4 py-3">
                      {trend !== 0 && (
                        <div className="flex items-center gap-1">
                          {trend > 0 ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-500">+{trend}</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-500">{trend}</span>
                            </>
                          )}
                        </div>
                      )}
                      {trend === 0 && (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
