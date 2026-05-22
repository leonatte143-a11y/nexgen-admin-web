import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
import { logout } from '../store/authSlice';
import type { RootState } from '../store';
import { NEXGEN_ORANGE } from '../theme';

const DRAWER_WIDTH = 260;

const navItems = [
  { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/kyc', label: 'Partner KYC', icon: <VerifiedUserIcon /> },
  { path: '/pricing', label: 'Service & Pricing', icon: <CategoryIcon /> },
  { path: '/bookings', label: 'Bookings', icon: <EventNoteIcon /> },
  { path: '/live', label: 'Live Monitor', icon: <LiveTvIcon /> },
  { path: '/support', label: 'Disputes & Support', icon: <SupportAgentIcon /> },
  { path: '/payouts', label: 'Payouts', icon: <PaymentsIcon /> },
  { path: '/geo', label: 'Geo & Heatmaps', icon: <MapIcon /> },
  { path: '/marketing', label: 'Coupons & Marketing', icon: <LocalOfferIcon /> },
  { path: '/users', label: 'Users', icon: <PeopleIcon /> },
  { path: '/partners', label: 'Partners', icon: <EngineeringIcon /> },
  { path: '/notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const admin = useSelector((s: RootState) => s.auth.admin);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: NEXGEN_ORANGE, color: '#fff' }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          NEXGEN
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          Admin Control Panel
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <List sx={{ flex: 1, py: 1 }}>
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
            {admin?.name} ({admin?.role})
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
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
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
