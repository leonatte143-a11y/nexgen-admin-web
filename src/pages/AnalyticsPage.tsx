import { useEffect, useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography, Card, CardContent } from '@mui/material';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { useSelector } from 'react-redux';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { normalizeRole } from '../config/rbac';
import type { RootState } from '../store';

type Period = 'day' | 'week' | 'month' | 'year';

interface AnalyticsPayload {
  period: Period;
  totalEarnings?: number;
  grossRevenue?: number;
  adminCommission?: number;
  activeBookings?: number;
  userGrowth: number;
  partnerOnboarding: number;
  series: { date: string; bookings?: number; revenue?: number; partners?: number }[];
}

export function AnalyticsPage() {
  const role = normalizeRole(useSelector((s: RootState) => s.auth.admin?.role));
  const [period, setPeriod] = useState<Period>('week');
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setData((await adminApi.analytics(period)) as AnalyticsPayload);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [period]);

  if (loading) return <LoadingState />;

  const chartKey = role === 'hr' ? 'partners' : role === 'manager' ? 'bookings' : 'revenue';
  const chartLabel = role === 'hr' ? 'Partner Onboarding' : role === 'manager' ? 'Bookings' : 'Revenue (₹)';

  return (
    <>
      <PageHeader title="Analytics Power Center" subtitle="Role-based operational metrics" />
      <ErrorAlert message={error} />
      <ToggleButtonGroup
        value={period}
        exclusive
        onChange={(_, v) => v && setPeriod(v)}
        size="small"
        sx={{ mb: 2 }}
      >
        {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
          <ToggleButton key={p} value={p}>{p}</ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        {role === 'admin' && (
          <>
            <Stat label="Total Earnings" value={`₹${data?.totalEarnings ?? 0}`} />
            <Stat label="Gross Revenue" value={`₹${data?.grossRevenue ?? 0}`} />
            <Stat label="NEXGEN 10%" value={`₹${data?.adminCommission ?? 0}`} />
          </>
        )}
        {role !== 'hr' && <Stat label="Active Bookings" value={String(data?.activeBookings ?? 0)} />}
        {role === 'admin' && <Stat label="User Growth" value={String(data?.userGrowth ?? 0)} />}
        {(role === 'admin' || role === 'hr') && (
          <Stat label="Partner Onboarding" value={String(data?.partnerOnboarding ?? 0)} />
        )}
      </Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>{chartLabel}</Typography>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data?.series || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={chartKey} stroke="#FF6B00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="outlined" sx={{ minWidth: 160 }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}
