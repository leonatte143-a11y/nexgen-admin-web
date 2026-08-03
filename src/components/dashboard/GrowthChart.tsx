import { Box } from '@mui/material';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { KAIRO_ORANGE } from '../../theme';

interface GrowthChartProps {
  data: number[];
  height?: number;
  color?: string;
}

export function GrowthChart({ data, height = 48, color = KAIRO_ORANGE }: GrowthChartProps) {
  const points = data.map((value, index) => ({ index, value }));

  if (points.length === 0) {
    return <Box sx={{ height, bgcolor: 'action.hover', borderRadius: 1 }} />;
  }

  return (
    <Box sx={{ height, width: '100%', mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill="url(#growthFill)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
