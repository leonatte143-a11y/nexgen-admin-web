import type { DashboardAlert } from '../types/dashboard';
import type { DashboardAlertsResponse } from '../types/dashboardApi';

export function mapAlertsFromApi(data: DashboardAlertsResponse): DashboardAlert[] {
  const items: DashboardAlert[] = [
    {
      id: 'kyc',
      title: 'Pending KYC approvals',
      description: 'Partners awaiting verification',
      severity: 'warning',
      href: '/kyc',
      count: data.pendingKycCount,
    },
    {
      id: 'payouts',
      title: 'Partner payout requests',
      description: 'Settlement queue needs review',
      severity: 'warning',
      href: '/payouts',
      count: data.pendingPayoutRequestsCount,
    },
    {
      id: 'disputes',
      title: 'Active disputes',
      description: 'Open support tickets & escalations',
      severity: 'critical',
      href: '/support',
      count: data.activeDisputesCount,
    },
    {
      id: 'tickets',
      title: 'Open support tickets',
      description: 'Customer & partner issues',
      severity: 'warning',
      href: '/support',
      count: data.openTicketsCount,
    },
    {
      id: 'bookings',
      title: 'Failed / stuck bookings',
      description: 'Requires manual review',
      severity: 'critical',
      href: '/bookings',
      count: data.failedBookingsCount,
    },
    {
      id: 'reviews',
      title: 'Negative reviews',
      description: 'Rating below 3 stars',
      severity: 'warning',
      href: '/support',
      count: data.negativeReviewsCount,
    },
  ];
  return items.filter((a) => (a.count ?? 0) > 0);
}
