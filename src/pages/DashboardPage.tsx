import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { adminApi } from '../api/adminApi';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import type { DashboardStats, BookingChartPoint } from '../types/api';

function formatInr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chart, setChart] = useState<BookingChartPoint[]>([]);
  const [activity, setActivity] = useState<{ type: string; title: string; subtitle?: string; at: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, c, a] = await Promise.all([
        adminApi.dashboardStats(),
        adminApi.bookingsChart(7),
        adminApi.recentActivity(),
      ]);
      setStats(s);
      setChart(c);
      setActivity(a as typeof activity);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading && !stats) return <LoadingState />;
  if (!stats) return <ErrorAlert message={error} />;

  return (
    <>
      <PageHeader title="Command Center" subtitle="Live business health — Rajahmundry & Guntur" />
      <ErrorAlert message={error} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Revenue (10%)" value={formatInr(stats.totalRevenue)} highlight subtitle={`Today: ${formatInr(stats.revenueToday)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Active Partners" value={stats.activePartners} subtitle={`${stats.onlinePartners} online now`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Live Bookings" value={stats.liveBookings} subtitle={`${stats.bookingsToday} today`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} subtitle={`${stats.totalBookings} bookings`} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bookings per Day
              </Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#FF8C00" name="Bookings" />
                    <Bar dataKey="completed" fill="#4CAF50" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Unmet Demand
              </Typography>
              <List dense>
                {stats.unmetDemand.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No unmet searches yet</Typography>
                )}
                {stats.unmetDemand.map((u) => (
                  <ListItem key={u.keyword} disablePadding sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={u.keyword}
                      secondary={`${u.searches} searches · ${u.partnersFound} partners`}
                    />
                    <Chip label="Recruit" size="small" color="primary" variant="outlined" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {activity.slice(0, 8).map((a, i) => (
                  <ListItem key={i} disablePadding>
                    <ListItemText primary={a.title} secondary={a.subtitle} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
