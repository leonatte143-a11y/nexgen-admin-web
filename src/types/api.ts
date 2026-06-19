export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  mustResetPassword?: boolean;
  permissions?: string[];
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
  mustResetPassword?: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  activePartners: number;
  onlinePartners: number;
  totalBookings: number;
  bookingsToday: number;
  totalRevenue: number;
  revenueToday: number;
  liveBookings: number;
  commissionRate: number;
  unmetDemand: { keyword: string; searches: number; partnersFound: number }[];
}

export interface BookingChartPoint {
  date: string;
  bookings: number;
  completed: number;
}
