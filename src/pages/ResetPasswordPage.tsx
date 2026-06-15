import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { apiPost, apiClient } from '../api/client';
import { NEXGEN_ORANGE } from '../theme';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

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
    if (loading) return; // prevent duplicate submits
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('nexgen_admin_token');
      if (token) {
        await apiClient.post('/auth/admin/change-password', { newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await apiPost('/auth/admin/change-password', { newPassword });
      }

      // Clear sensitive auth state and ensure force-reset flag is removed
      try {
        localStorage.removeItem('nexgen_admin_token');
        localStorage.removeItem('nexgen_admin_user');
      } catch (e) {
        // ignore localStorage errors
      }

      // Clear fields and show success message then redirect to login
      setNewPassword('');
      setConfirm('');
      setSuccess('Password changed successfully. Please login with your new password.');

      // short delay for user to read message
      setTimeout(() => {
        navigate('/login', { state: { passwordChanged: true } });
      }, 1200);
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
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
