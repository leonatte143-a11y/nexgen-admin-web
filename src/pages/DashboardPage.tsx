import { Box, Card, CardContent, Grid, IconButton, List, ListItem, ListItemText, Tooltip, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import {
  BookingsChartCard,
  CustomerPulsePanel,
  DashboardSection,
  FinancialPipeline,
  GrowthChart,
  HeatmapPreview,
  PartnerPerformancePanel,
  SupportChatHub,
  UnmetDemandPanel,
  UrgentAlertsPanel,
} from '../components/dashboard';
import { formatPct } from '../utils/format';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatInr } from '../utils/format';
import { Can } from '../components/Can';
import { PERMISSIONS } from '../config/rbac';

export function DashboardPage() {
  const { stats, chart, activity, extended, loading, error, reload } = useDashboardData();

  if (loading && !stats) return <LoadingState label="Loading command center…" />;
  if (!stats) return <ErrorAlert message={error} />;

  const { financial, alerts, topByJobs, topByRating, userGrowth, customerPulse, heatmapPreview, supportChat } =
    extended;

  // `activeAds`/`pendingCustomCategories` were added to the backend dashboard stats payload
  // but the shared DashboardStats type in adminApi.ts is intentionally left untouched here
  // (a parallel workstream may be editing that file), so we widen the type locally instead.
  const extraStats = stats as typeof stats & { activeAds?: number; pendingCustomCategories?: number };

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Command Center"
        subtitle="Marketplace operations — Rajahmundry & Guntur"
        action={
          <Tooltip title="Refresh dashboard">
            <IconButton onClick={reload} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <ErrorAlert message={error} />

      {/* TOP: KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Can permission={PERMISSIONS.REVENUE_VIEW}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title="Total Revenue"
              value={formatInr(stats.totalRevenue)}
              highlight
              subtitle={`Today: ${formatInr(stats.revenueToday)} · ${stats.commissionRate}% commission`}
            />
          </Grid>
        </Can>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Active Partners"
            value={stats.activePartners}
            subtitle={`${stats.onlinePartners} online now`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Live Bookings" value={stats.liveBookings} subtitle={`${stats.bookingsToday} today`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Users"
            value={userGrowth.totalUsers.toLocaleString('en-IN')}
            subtitle={`${stats.totalBookings.toLocaleString()} total bookings`}
            trend={{ value: userGrowth.weeklyGrowthPct, label: 'this week' }}
            sparklineData={userGrowth.sparkline}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Active Ads" value={extraStats.activeAds ?? 0} subtitle="Approved & live" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Pending Custom Categories"
            value={extraStats.pendingCustomCategories ?? 0}
            subtitle="Awaiting verification"
          />
        </Grid>
      </Grid>

      {/* TOP: Alerts */}
      <UrgentAlertsPanel alerts={alerts} />

      {/* TOP: Financial pipeline */}
      <Can permission={PERMISSIONS.REVENUE_VIEW}>
        <DashboardSection title="Financial Pipeline" subtitle="Revenue, payouts, escrow & income streams">
          <FinancialPipeline
            totalRevenue={financial.totalRevenue}
            pendingPayouts={financial.pendingPayouts}
            escrowBalance={financial.escrowBalance}
            totalCommissionEarned={financial.totalCommissionEarned}
            revenueToday={financial.revenueToday}
            categories={financial.categories}
          />
        </DashboardSection>
      </Can>

      {/* MIDDLE: Partner performance + Customer pulse */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <PartnerPerformancePanel topByJobs={topByJobs} topByRating={topByRating} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <CustomerPulsePanel data={customerPulse} />
        </Grid>
      </Grid>

      {/* MIDDLE: Growth analytics chart + activity */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <BookingsChartCard data={chart} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                User Growth
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                {formatPct(userGrowth.monthlyGrowthPct)} monthly
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatPct(userGrowth.weeklyGrowthPct)} this week · marketing effectiveness
              </Typography>
              <GrowthChart data={userGrowth.sparkline} height={56} />
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                Recent Activity
              </Typography>
              <List dense>
                {activity.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No recent activity
                  </Typography>
                )}
                {activity.slice(0, 6).map((a, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
                    <ListItemText primary={a.title} secondary={a.subtitle} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* BOTTOM: Live monitor */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <HeatmapPreview data={heatmapPreview} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <UnmetDemandPanel items={stats.unmetDemand} />
        </Grid>
      </Grid>

      {/* BOTTOM: Support chat */}
      <DashboardSection
        title="Support Chat Command Hub"
        subtitle="Customer, partner & internal admin messaging (integration-ready)"
      >
        <SupportChatHub
          activeChats={supportChat.activeChats}
          internalThreads={supportChat.internalThreads}
          provider={supportChat.provider}
        />
      </DashboardSection>
    </Box>
  );
}
