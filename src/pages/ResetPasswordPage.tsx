import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { apiPost } from '../api/client';
import { NEXGEN_ORANGE } from '../theme';
import { defaultPathForRole } from '../config/rbac';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const admin = useSelector((s: RootState) => s.auth.admin);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiPost('/auth/admin/change-password', { newPassword });
      const raw = localStorage.getItem('nexgen_admin_user');
      if (raw) {
        const user = JSON.parse(raw);
        user.mustResetPassword = false;
        localStorage.setItem('nexgen_admin_user', JSON.stringify(user));
      }
      navigate(defaultPathForRole(admin?.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFF8F0', px: 2 }}>
      <Paper sx={{ p: 3, maxWidth: 420, width: '100%', borderRadius: 2, border: '1px solid #FFE0B2' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: NEXGEN_ORANGE, mb: 1 }}>
          Set New Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You must change your temporary password before accessing the admin panel.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required fullWidth />
          <TextField label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Update Password'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
