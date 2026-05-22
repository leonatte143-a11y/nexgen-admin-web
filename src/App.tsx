import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { theme } from './theme';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { KycPage } from './pages/KycPage';
import { PricingPage } from './pages/PricingPage';
import { BookingsPage } from './pages/BookingsPage';
import { LiveBookingsPage } from './pages/LiveBookingsPage';
import { SupportPage } from './pages/SupportPage';
import { PayoutsPage } from './pages/PayoutsPage';
import { GeoPage } from './pages/GeoPage';
import { MarketingPage } from './pages/MarketingPage';
import { UsersPage } from './pages/UsersPage';
import { PartnersPage } from './pages/PartnersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

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
                <Route path="kyc" element={<KycPage />} />
                <Route path="pricing" element={<PricingPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="live" element={<LiveBookingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="payouts" element={<PayoutsPage />} />
                <Route path="geo" element={<GeoPage />} />
                <Route path="marketing" element={<MarketingPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="partners" element={<PartnersPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
