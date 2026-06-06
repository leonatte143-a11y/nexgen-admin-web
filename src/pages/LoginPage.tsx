import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { loginAdmin, clearError } from '../store/authSlice';
import type { AppDispatch, RootState } from '../store';
import { NEXGEN_ORANGE } from '../theme';

export function LoginPage() {
  const [email, setEmail] = useState('admin@nexgen.local');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const location = useLocation();
  const passwordChanged = Boolean((location.state as any)?.passwordChanged);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginAdmin({ email, password }));
    if (loginAdmin.fulfilled.match(result)) {
      const mustReset = result.payload.mustResetPassword || result.payload.admin?.mustResetPassword;
      navigate(mustReset ? '/reset-password' : '/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        bgcolor: '#FFF8F0',
        backgroundImage: `linear-gradient(160deg, ${NEXGEN_ORANGE}18 0%, #fff 45%)`,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 3,
          borderRadius: 2,
          border: '1px solid #FFE0B2',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
          NEXGEN Admin
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Sign in to the control panel
        </Typography>

        {passwordChanged && (
          <Alert severity="success" sx={{ mb: 2, py: 0.5 }}>
            Password changed successfully. Please login with your new password.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            size="small"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 0.5, py: 1.1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
