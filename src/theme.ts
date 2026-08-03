import { createTheme } from '@mui/material/styles';

export const KAIRO_ORANGE = '#FF8C00';

export const theme = createTheme({
  palette: {
    primary: { main: KAIRO_ORANGE, dark: '#E67E00', light: '#FFA733' },
    background: { default: '#F5F6F8', paper: '#FFFFFF' },
    success: { main: '#2E7D32' },
    error: { main: '#D32F2F' },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Segoe UI", Roboto, sans-serif',
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid #FFE0B2' },
      },
    },
  },
});
