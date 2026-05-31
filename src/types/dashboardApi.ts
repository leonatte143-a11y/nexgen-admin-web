import type {
  CustomerPulseData,
  DashboardAlert,
  FinancialSummary,
  HeatmapPreviewData,
  PartnerPerformanceRow,
  SupportChatHubData,
  UserGrowthMetrics,
} from './dashboard';

export interface PartnerPerformanceResponse {
  topByJobs: PartnerPerformanceRow[];
  topByRating: PartnerPerformanceRow[];
  totalPartners: number;
}

export interface FinancialBreakdownResponse {
  totalRevenue: number;
  revenueToday: number;
  totalCommissionEarned: number;
  categories: FinancialSummary['categories'];
}

export interface FinancialPipelineResponse {
  pendingPayouts: number;
  escrowBalance: number;
  partnerWalletTotal: number;
  payoutQueueCount: number;
  completedUnpaidBookingTotal: number;
  settlementPending?: number;
}

export interface UserGrowthResponse {
  totalUsers: number;
  currentPeriodUsers: number;
  previousPeriodUsers: number;
  growthPercent: number;
  weeklyGrowthPct?: number;
  monthlyGrowthPct: number;
  sparkline: { date: string; count: number }[];
}

export interface DashboardAlertsResponse {
  pendingKycCount: number;
  openTicketsCount: number;
  pendingPayoutRequestsCount: number;
  negativeReviewsCount: number;
  activeDisputesCount: number;
  failedBookingsCount: number;
}

export interface SupportChatSummaryResponse extends SupportChatHubData {
  activeConversationsCount: number;
  unresolvedConversationsCount: number;
}

export interface DashboardExtendedData {
  alerts: DashboardAlert[];
  financial: FinancialSummary;
  topByJobs: PartnerPerformanceRow[];
  topByRating: PartnerPerformanceRow[];
  userGrowth: UserGrowthMetrics;
  customerPulse: CustomerPulseData;
  heatmapPreview: HeatmapPreviewData;
  supportChat: SupportChatHubData;
}
