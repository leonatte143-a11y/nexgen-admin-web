/** Mirrors backend src/constants/rbac.js — keep in sync for UI guards. */
export type AdminRole =
  | 'admin'
  | 'super_admin'
  | 'manager'
  | 'hr'
  | 'marketing'
  | 'client_support'
  | 'recruitment_exec';

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  REVENUE_VIEW: 'revenue:view',
  PAYOUTS_MANAGE: 'payouts:manage',
  PRICING_MANAGE: 'pricing:manage',
  SERVICES_MANAGE: 'services:manage',
  KYC_MANAGE: 'kyc:manage',
  PARTNERS_MANAGE: 'partners:manage',
  PARTNERS_COMPLIANCE: 'partners:compliance',
  BOOKINGS_MANAGE: 'bookings:manage',
  BOOKINGS_REASSIGN: 'bookings:reassign',
  LIVE_MONITOR: 'live:view',
  DEMAND_ANALYTICS: 'demand:view',
  ESTABLISH_LOCATION: 'zones:establish',
  ANALYTICS_VIEW: 'analytics:view',
  AUDIT_VIEW: 'audit:view',
  SUPPORT_MANAGE: 'support:manage',
  USERS_MANAGE: 'users:manage',
  MARKETING_MANAGE: 'marketing:manage',
  NOTIFICATIONS_BROADCAST: 'notifications:broadcast',
  SETTINGS_MANAGE: 'settings:manage',
  STAFF_MANAGE: 'staff:manage',
  PAYROLL_VIEW: 'payroll:view',
  CHAT_MONITOR: 'chat:monitor',
  FRAUD_VIEW: 'fraud:view',
  SHOPS_MANAGE: 'shops:manage',
  SHOPS_VERIFY: 'shops:verify',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function normalizeRole(role?: string | null): AdminRole {
  const r = String(role || 'admin').toLowerCase();
  if (r === 'super_admin') return 'admin';
  if (
    r === 'manager' ||
    r === 'hr' ||
    r === 'marketing' ||
    r === 'client_support' ||
    r === 'recruitment_exec'
  ) {
    return r;
  }
  return 'admin';
}

const ALL = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ALL,
  manager: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.BOOKINGS_MANAGE,
    PERMISSIONS.BOOKINGS_REASSIGN,
    PERMISSIONS.LIVE_MONITOR,
    PERMISSIONS.DEMAND_ANALYTICS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.PARTNERS_MANAGE,
    PERMISSIONS.CHAT_MONITOR,
    PERMISSIONS.PRICING_MANAGE,
    PERMISSIONS.SERVICES_MANAGE,
    PERMISSIONS.SHOPS_VERIFY,
  ],
  hr: [PERMISSIONS.STAFF_MANAGE, PERMISSIONS.PAYROLL_VIEW],
  marketing: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.DEMAND_ANALYTICS,
    PERMISSIONS.MARKETING_MANAGE,
    PERMISSIONS.NOTIFICATIONS_BROADCAST,
  ],
  client_support: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.LIVE_MONITOR,
    PERMISSIONS.BOOKINGS_MANAGE,
    PERMISSIONS.CHAT_MONITOR,
    PERMISSIONS.SUPPORT_MANAGE,
  ],
  recruitment_exec: [
    PERMISSIONS.KYC_MANAGE,
    PERMISSIONS.PARTNERS_MANAGE,
    PERMISSIONS.PARTNERS_COMPLIANCE,
  ],
};

export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  const normalized = normalizeRole(role);
  const perms = ROLE_PERMISSIONS[normalized] || ROLE_PERMISSIONS.admin;
  return perms.includes(permission);
}

export function hasAnyPermission(role: string | undefined | null, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export interface NavItem {
  path: string;
  label: string;
  permission: Permission | Permission[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
  { path: '/analytics', label: 'Analytics Center', permission: PERMISSIONS.ANALYTICS_VIEW },
  { path: '/audit', label: 'Audit Monitor', permission: PERMISSIONS.AUDIT_VIEW },
  { path: '/demand', label: 'Search Analytics', permission: PERMISSIONS.DEMAND_ANALYTICS },
  { path: '/kyc', label: 'Partner KYC', permission: PERMISSIONS.KYC_MANAGE },
  { path: '/strikes', label: 'Strike Board', permission: PERMISSIONS.PARTNERS_COMPLIANCE },
  { path: '/pricing', label: 'Service & Pricing', permission: [PERMISSIONS.PRICING_MANAGE, PERMISSIONS.SERVICES_MANAGE] },
  { path: '/partner-prices', label: 'Partner Price Review', permission: PERMISSIONS.PRICING_MANAGE },
  { path: '/bookings', label: 'Bookings', permission: PERMISSIONS.BOOKINGS_MANAGE },
  { path: '/live', label: 'Live Monitor', permission: PERMISSIONS.LIVE_MONITOR },
  { path: '/chat', label: 'Super Chat', permission: PERMISSIONS.CHAT_MONITOR },
  { path: '/support', label: 'Disputes & Support', permission: PERMISSIONS.SUPPORT_MANAGE },
  { path: '/staff', label: 'Staff Management', permission: PERMISSIONS.STAFF_MANAGE },
  { path: '/payouts', label: 'Monday Settlement', permission: PERMISSIONS.PAYOUTS_MANAGE },
  { path: '/payroll', label: 'Staff Payroll', permission: PERMISSIONS.PAYROLL_VIEW },
  { path: '/geo', label: 'Geo & Heatmaps', permission: PERMISSIONS.DEMAND_ANALYTICS },
  { path: '/marketing', label: 'Coupons & Marketing', permission: PERMISSIONS.MARKETING_MANAGE },
  { path: '/ad-campaigns', label: 'Ad Campaigns', permission: PERMISSIONS.MARKETING_MANAGE },
  { path: '/users', label: 'Users', permission: PERMISSIONS.USERS_MANAGE },
  { path: '/partners', label: 'Partners', permission: PERMISSIONS.PARTNERS_MANAGE },
  { path: '/shops', label: 'Shops & Market', permission: [PERMISSIONS.SHOPS_VERIFY, PERMISSIONS.SHOPS_MANAGE] },
  { path: '/notifications', label: 'Notifications', permission: PERMISSIONS.NOTIFICATIONS_BROADCAST },
  { path: '/settings', label: 'Settings', permission: PERMISSIONS.SETTINGS_MANAGE },
];

/** Sidebar entries restricted to full admin role (not manager/hr). */
const ADMIN_ONLY_PATHS = new Set(['/partner-prices']);

export function navItemsForRole(role?: string | null) {
  const normalized = normalizeRole(role);
  return NAV_ITEMS.filter((item) => {
    if (ADMIN_ONLY_PATHS.has(item.path) && normalized !== 'admin') return false;
    const perms = Array.isArray(item.permission) ? item.permission : [item.permission];
    return hasAnyPermission(role, perms);
  });
}

export function defaultPathForRole(role?: string | null): string {
  const items = navItemsForRole(role);
  return items[0]?.path || '/login';
}

export const ROUTE_PERMISSIONS: Record<string, Permission | Permission[]> = Object.fromEntries(
  NAV_ITEMS.map((n) => [n.path, n.permission]),
);
