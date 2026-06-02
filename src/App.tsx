import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { theme } from './theme';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { DemandAnalyticsPage } from './pages/DemandAnalyticsPage';
import { KycPage } from './pages/KycPage';
import { StrikeBoardPage } from './pages/StrikeBoardPage';
import { PricingPage } from './pages/PricingPage';
import { BookingsPage } from './pages/BookingsPage';
import { LiveBookingsPage } from './pages/LiveBookingsPage';
import { ChatMonitorPage } from './pages/ChatMonitorPage';
import { SupportPage } from './pages/SupportPage';
import { PayoutsPage } from './pages/PayoutsPage';
import { PayrollPage } from './pages/PayrollPage';
import { GeoPage } from './pages/GeoPage';
import { MarketingPage } from './pages/MarketingPage';
import { UsersPage } from './pages/UsersPage';
import { PartnersPage } from './pages/PartnersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PERMISSIONS } from './config/rbac';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route element={<RoleRoute permission={PERMISSIONS.ANALYTICS_VIEW} />}>
                  <Route path="analytics" element={<AnalyticsPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.AUDIT_VIEW} />}>
                  <Route path="audit" element={<AuditLogsPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.DEMAND_ANALYTICS} />}>
                  <Route path="demand" element={<DemandAnalyticsPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.KYC_MANAGE} />}>
                  <Route path="kyc" element={<KycPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.PARTNERS_COMPLIANCE} />}>
                  <Route path="strikes" element={<StrikeBoardPage />} />
                </Route>
                <Route element={<RoleRoute permission={[PERMISSIONS.PRICING_MANAGE, PERMISSIONS.SERVICES_MANAGE]} />}>
                  <Route path="pricing" element={<PricingPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.BOOKINGS_MANAGE} />}>
                  <Route path="bookings" element={<BookingsPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.LIVE_MONITOR} />}>
                  <Route path="live" element={<LiveBookingsPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.CHAT_MONITOR} />}>
                  <Route path="chat" element={<ChatMonitorPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.SUPPORT_MANAGE} />}>
                  <Route path="support" element={<SupportPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.PAYOUTS_MANAGE} />}>
                  <Route path="payouts" element={<PayoutsPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.PAYROLL_VIEW} />}>
                  <Route path="payroll" element={<PayrollPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.DEMAND_ANALYTICS} />}>
                  <Route path="geo" element={<GeoPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.MARKETING_MANAGE} />}>
                  <Route path="marketing" element={<MarketingPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.USERS_MANAGE} />}>
                  <Route path="users" element={<UsersPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.PARTNERS_MANAGE} />}>
                  <Route path="partners" element={<PartnersPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.NOTIFICATIONS_BROADCAST} />}>
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
                <Route element={<RoleRoute permission={PERMISSIONS.SETTINGS_MANAGE} />}>
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
