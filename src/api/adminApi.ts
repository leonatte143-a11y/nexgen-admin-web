import { apiGet, apiPost, apiPut } from './client';
import type { DashboardStats, BookingChartPoint, LoginResponse } from '../types/api';
import type {
  DashboardAlertsResponse,
  FinancialBreakdownResponse,
  FinancialPipelineResponse,
  PartnerPerformanceResponse,
  SupportChatSummaryResponse,
  UserGrowthResponse,
} from '../types/dashboardApi';
import type { CustomerPulseData } from '../types/dashboard';

export const adminApi = {
  login: (email: string, password: string) =>
    apiPost<LoginResponse>('/auth/admin/login', { email, password }),

  dashboardStats: () => apiGet<DashboardStats>('/admin/dashboard/stats'),
  bookingsChart: (days = 7) => apiGet<BookingChartPoint[]>('/admin/dashboard/bookings-chart', { days }),
  recentActivity: () => apiGet<unknown[]>('/admin/dashboard/recent-activity'),
  partnerPerformance: () => apiGet<PartnerPerformanceResponse>('/admin/dashboard/partner-performance'),
  financialBreakdown: () => apiGet<FinancialBreakdownResponse>('/admin/dashboard/financial-breakdown'),
  financialPipeline: () => apiGet<FinancialPipelineResponse>('/admin/dashboard/financial-pipeline'),
  userGrowth: (range = '7d') => apiGet<UserGrowthResponse>('/admin/dashboard/user-growth', { range }),
  reviewsSentiment: (limit = 10) => apiGet<CustomerPulseData & { negativeReviewCount: number }>('/admin/dashboard/reviews-sentiment', { limit }),
  supportChatSummary: () => apiGet<SupportChatSummaryResponse>('/admin/dashboard/support-chat-summary'),
  dashboardAlerts: () => apiGet<DashboardAlertsResponse>('/admin/dashboard/alerts'),
  searchAnalytics: () => apiGet<{ keyword: string; searches: number; avgPartnersFound: number; unmet: boolean }[]>('/admin/search-analytics'),
  heatmap: () => apiGet<unknown>('/admin/heatmap'),

  partners: (params?: Record<string, string>) => apiGet<unknown[]>('/admin/partners', params),
  pendingKyc: () => apiGet<unknown[]>('/admin/partners/kyc/pending'),
  approveKyc: (id: string) => apiPost(`/admin/partners/kyc/${id}/approve`),
  rejectKyc: (id: string, reason?: string) => apiPost(`/admin/partners/kyc/${id}/reject`, { reason }),

  categories: () => apiGet<unknown[]>('/admin/categories'),
  updateCategory: (id: string, body: unknown) => apiPut(`/admin/categories/${id}`, body),
  services: () => apiGet<unknown[]>('/admin/services'),
  updateService: (id: string, body: unknown) => apiPut(`/admin/services/${id}`, body),

  bookings: (params?: Record<string, string>) => apiGet<{ items: unknown[]; total: number }>('/admin/bookings', params),
  liveBookings: () => apiGet<unknown[]>('/admin/bookings/live'),
  assignPartner: (bookingId: string, partnerId: string) =>
    apiPut(`/admin/bookings/${bookingId}/assign`, { partnerId }),

  users: (q?: string) => apiGet<unknown[]>('/admin/users', q ? { q } : undefined),
  blockUser: (id: string, blocked: boolean) => apiPut(`/admin/users/${id}/block`, { blocked }),

  tickets: (status?: string) => apiGet<unknown[]>('/admin/support/tickets', status ? { status } : undefined),
  freezePayment: (id: string) => apiPost(`/admin/support/tickets/${id}/freeze-payment`),
  refund: (id: string) => apiPost(`/admin/support/tickets/${id}/refund`),

  payoutQueue: () => apiGet<unknown>('/admin/payouts/queue'),
  generatePayout: () => apiPost<{ csv: string; count: number }>('/admin/payouts/generate'),
  settlementHistory: () => apiGet<unknown[]>('/admin/payouts/history'),
  commissionReport: () => apiGet<unknown>('/admin/payouts/commission-report'),

  coupons: () => apiGet<unknown[]>('/admin/coupons'),
  createCoupon: (body: unknown) => apiPost('/admin/coupons', body),
  updateCoupon: (id: string, body: unknown) => apiPut(`/admin/coupons/${id}`, body),

  broadcast: (body: { title: string; body: string; city?: string; type?: string }) =>
    apiPost('/admin/notifications/broadcast', body),
  notifications: () => apiGet<unknown[]>('/admin/notifications'),

  settings: () => apiGet<Record<string, unknown>>('/admin/settings'),
  updateSettings: (body: Record<string, unknown>) => apiPut('/admin/settings', body),
  geoZones: () => apiGet<unknown[]>('/admin/geo/zones'),
  setSurge: (city: string, surgeFee: number) => apiPost('/admin/geo/surge', { city, surgeFee }),
};
