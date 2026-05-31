import { Box, Card, CardContent, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { ReactNode } from 'react';
import { GrowthChart } from './dashboard/GrowthChart';
import { formatPct } from '../utils/format';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
  trend?: { value: number; label: string };
  sparklineData?: number[];
  icon?: ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  highlight,
  trend,
  sparklineData,
  icon,
}: StatCardProps) {
  const trendUp = trend && trend.value >= 0;

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
        background: highlight
          ? 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)'
          : undefined,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {icon}
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700 }}
          color={highlight ? 'primary.main' : 'text.primary'}
        >
          {value}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            {trendUp ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: trendUp ? 'success.main' : 'error.main' }}
            >
              {formatPct(trend.value)} {trend.label}
            </Typography>
          </Box>
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
        {sparklineData && sparklineData.length > 0 && <GrowthChart data={sparklineData} />}
      </CardContent>
    </Card>
  );
}
