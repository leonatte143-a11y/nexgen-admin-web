import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import type { BookingChartPoint, DashboardStats } from '../types/api';
import type { DashboardExtendedData } from '../types/dashboardApi';
import { mapAlertsFromApi } from '../utils/dashboardAlerts';
import { mapHeatmapFromApi } from '../utils/heatmapMapper';

interface ActivityItem {
  type: string;
  title: string;
  subtitle?: string;
  at: string;
}

const EMPTY_EXTENDED: DashboardExtendedData = {
  alerts: [],
  financial: {
    totalRevenue: 0,
    pendingPayouts: 0,
    escrowBalance: 0,
    totalCommissionEarned: 0,
    revenueToday: 0,
    categories: [],
  },
  topByJobs: [],
  topByRating: [],
  userGrowth: {
    totalUsers: 0,
    weeklyGrowthPct: 0,
    monthlyGrowthPct: 0,
    sparkline: [],
  },
  customerPulse: { averageRating: 0, reviews: [] },
  heatmapPreview: { cities: [], hotspots: [], onlinePartners: 0, searchPointsCount: 0 },
  supportChat: { activeChats: [], internalThreads: [], provider: 'placeholder' },
};

export interface DashboardPageData {
  stats: DashboardStats | null;
  chart: BookingChartPoint[];
  activity: ActivityItem[];
  extended: DashboardExtendedData;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useDashboardData(): DashboardPageData {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chart, setChart] = useState<BookingChartPoint[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [extended, setExtended] = useState<DashboardExtendedData>(EMPTY_EXTENDED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        s,
        c,
        a,
        heatmap,
        partnerPerf,
        financialBreakdown,
        financialPipeline,
        userGrowth,
        reviews,
        supportChat,
        alertsRaw,
      ] = await Promise.all([
        adminApi.dashboardStats(),
        adminApi.bookingsChart(7),
        adminApi.recentActivity(),
        adminApi.heatmap(),
        adminApi.partnerPerformance(),
        adminApi.financialBreakdown(),
        adminApi.financialPipeline(),
        adminApi.userGrowth('7d'),
        adminApi.reviewsSentiment(10),
        adminApi.supportChatSummary(),
        adminApi.dashboardAlerts(),
      ]);

      setStats(s);
      setChart(c);
      setActivity(a as ActivityItem[]);

      const sparklineCounts = userGrowth.sparkline.map((p) => p.count);

      setExtended({
        alerts: mapAlertsFromApi(alertsRaw),
        financial: {
          totalRevenue: financialBreakdown.totalRevenue,
          pendingPayouts: financialPipeline.pendingPayouts,
          escrowBalance: financialPipeline.escrowBalance,
          totalCommissionEarned: financialBreakdown.totalCommissionEarned,
          revenueToday: financialBreakdown.revenueToday,
          categories: financialBreakdown.categories.map((cat) => ({
            id: cat.id,
            label: cat.label,
            amount: cat.amount,
          })),
        },
        topByJobs: partnerPerf.topByJobs,
        topByRating: partnerPerf.topByRating,
        userGrowth: {
          totalUsers: userGrowth.totalUsers,
          weeklyGrowthPct: userGrowth.weeklyGrowthPct ?? userGrowth.growthPercent,
          monthlyGrowthPct: userGrowth.monthlyGrowthPct,
          sparkline: sparklineCounts.length ? sparklineCounts : [0],
        },
        customerPulse: {
          averageRating: reviews.averageRating,
          reviews: reviews.reviews.map((r) => ({
            ...r,
            createdAt: String(r.createdAt),
          })),
        },
        heatmapPreview: mapHeatmapFromApi(heatmap),
        supportChat: {
          provider: supportChat.provider,
          activeChats: supportChat.activeChats,
          internalThreads: supportChat.internalThreads,
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  return { stats, chart, activity, extended, loading, error, reload: load };
}
