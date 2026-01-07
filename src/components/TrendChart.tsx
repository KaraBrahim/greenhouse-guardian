import { SensorData } from '@/types/sensor';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface TrendChartProps {
  data: SensorData[];
  dataKey: 'temp' | 'hum' | 'gas';
  color: string;
  title: string;
}

export function TrendChart({ data, dataKey, color, title }: TrendChartProps) {
  const chartData = data.map((d, index) => ({
    time: index,
    value: d[dataKey],
    timestamp: new Date(d.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));

  return (
    <div className="glass rounded-xl p-5 animate-fade-in">
      <h4 className="text-sm font-medium text-muted-foreground mb-4">{title} Trend</h4>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              hide 
            />
            <YAxis 
              hide
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(160 25% 8%)',
                border: '1px solid hsl(160 20% 18%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(_, payload) => payload[0]?.payload?.timestamp || ''}
              formatter={(value: number) => [value.toFixed(1), title]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
