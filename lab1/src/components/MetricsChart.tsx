import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface MetricPoint {
  epoch: number;
  sse: number;
  relError: number;
}

interface MetricsChartProps {
  data: MetricPoint[];
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  // We want to avoid rendering too many points down the line. It's fine for simple DOM rendering.
  // Recharts might get slow above 1000 points. Let's slice if needed for performance or render all.
  const chartData = useMemo(() => {
     if (data.length > 300) {
        // Downsample slightly or just show recent
        const factor = Math.ceil(data.length / 300);
        return data.filter((_, i) => i % factor === 0 || i === data.length - 1);
     }
     return data;
  }, [data]);

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold dark:text-zinc-100 mb-4 text-left">Error Convergence</h2>
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="epoch" 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              stroke="#9ca3af"
              minTickGap={20}
            />
            
            <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                stroke="#9ca3af"
                domain={['auto', 'auto']}
                 tickFormatter={(v) => v.toFixed(1)}
            />
            <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                stroke="#9ca3af" 
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
            />
            
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#374151' }}
            />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: '10px' }}/>
            
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="sse" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="SSE (E)" 
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="relError" 
              stroke="#ec4899" 
              strokeWidth={2}
              name="Rel. Error (σ %)" 
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
