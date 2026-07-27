import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CategoryIcon from '@mui/icons-material/Category';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PaymentsIcon from '@mui/icons-material/Payments';
import MapIcon from '@mui/icons-material/Map';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PeopleIcon from '@mui/icons-material/People';
import EngineeringIcon from '@mui/icons-material/Engineering';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import GavelIcon from '@mui/icons-material/Gavel';
import ChatIcon from '@mui/icons-material/Chat';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import { logout } from '../store/authSlice';
import type { RootState } from '../store';
import { NEXGEN_ORANGE } from '../theme';
import { navItemsForRole, normalizeRole } from '../config/rbac';

const DRAWER_WIDTH = 260;

const ICONS: Record<string, React.ReactNode> = {
  '/': <DashboardIcon />,
  '/analytics': <AnalyticsIcon />,
  '/audit': <HistoryIcon />,
  '/demand': <SearchIcon />,
  '/kyc': <VerifiedUserIcon />,
  '/strikes': <GavelIcon />,
  '/pricing': <CategoryIcon />,
  '/bookings': <EventNoteIcon />,
  '/live': <LiveTvIcon />,
  '/chat': <ChatIcon />,
  '/support': <SupportAgentIcon />,
  '/staff': <PeopleIcon />,
  '/payouts': <PaymentsIcon />,
  '/payroll': <AccountBalanceIcon />,
  '/geo': <MapIcon />,
  '/marketing': <LocalOfferIcon />,
  '/ad-campaigns': <CampaignIcon />,
  '/marketplace': <StorefrontIcon />,
  '/users': <PeopleIcon />,
  '/partners': <EngineeringIcon />,
  '/shops': <LocalOfferIcon />,
  '/notifications': <NotificationsIcon />,
  '/settings': <SettingsIcon />,
};

export function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const admin = useSelector((s: RootState) => s.auth.admin);
  const role = normalizeRole(admin?.role);
  const navItems = navItemsForRole(admin?.role, admin?.permissions).map((item) => ({
    ...item,
    icon: ICONS[item.path] || <DashboardIcon />,
  }));

  if (admin?.mustResetPassword) {
    return <Navigate to="/reset-password" replace />;
  }

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: NEXGEN_ORANGE,
        color: '#fff',
      }}
    >
      <Box sx={{ p: 2.5, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          NEXGEN
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          Admin Control Panel
        </Typography>
        <Chip label={role.toUpperCase()} size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
      <List
        sx={{
          flex: 1,
          minHeight: 0,
          py: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,255,255,0.35)',
            borderRadius: 3,
          },
        }}
      >
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setOpen(false);
            }}
            sx={{
              color: '#fff',
              '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.2)' },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
            }}
          >
            <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: 14 } } }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: '#fff',
          color: 'text.primary',
          borderBottom: '1px solid #eee',
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 } as const}>
            {navItems.find((n) => n.path === location.pathname)?.label || 'Admin'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {admin?.name} ({role})
          </Typography>
          <IconButton
            color="primary"
            onClick={() => {
              dispatch(logout());
              navigate('/login');
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            height: '100%',
            overflow: 'hidden',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, md: 3 },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
