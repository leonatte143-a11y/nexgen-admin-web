/** Dashboard domain types — API-ready; mock fallbacks in src/mock/dashboardMock.ts */

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface DashboardAlert {
  id: string;
  title: string;
  description?: string;
  severity: AlertSeverity;
  href: string;
  count?: number;
}

export interface PartnerPerformanceRow {
  id: string;
  name: string;
  rating: number;
  completedJobs: number;
  status: string;
  earnings: number;
  isOnline?: boolean;
}

export interface FinancialSummary {
  totalRevenue: number;
  pendingPayouts: number;
  escrowBalance: number;
  totalCommissionEarned: number;
  revenueToday: number;
  categories: RevenueCategory[];
}

export interface RevenueCategory {
  id: string;
  label: string;
  amount: number;
  trendPct?: number;
}

export interface UserGrowthMetrics {
  totalUsers: number;
  weeklyGrowthPct: number;
  monthlyGrowthPct: number;
  sparkline: number[];
}

export interface ReviewPulseItem {
  id: string;
  customerName: string;
  partnerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface CustomerPulseData {
  averageRating: number;
  reviews: ReviewPulseItem[];
}

export interface HeatmapPreviewData {
  cities: { name: string; activeBookings: number; demandLevel: 'high' | 'medium' | 'low' }[];
  hotspots: { area: string; label: string; intensity: number }[];
  onlinePartners: number;
  searchPointsCount: number;
}

export interface ChatThreadPreview {
  id: string;
  participantName: string;
  participantType: 'customer' | 'partner' | 'admin';
  lastMessage: string;
  unreadCount: number;
  isOnline: boolean;
  updatedAt: string;
}

export interface SupportChatHubData {
  activeChats: ChatThreadPreview[];
  internalThreads: ChatThreadPreview[];
  provider: 'placeholder' | 'firebase' | 'talkjs' | 'stream';
}

export interface UnmetDemandItem {
  keyword: string;
  searches: number;
  partnersFound: number;
  city?: string;
}

