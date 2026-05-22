import { useEffect, useState } from 'react';
import { Card, CardContent, TextField, Button, Grid, Typography } from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

export function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi
      .settings()
      .then((s) => setSettings(s as Record<string, string | number>))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await adminApi.updateSettings(settings);
      setSaved(true);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  if (loading) return <LoadingState />;
  const fields = [
    { key: 'commission_percent', label: 'Commission %' },
    { key: 'gst_percent', label: 'GST %' },
    { key: 'surge_fee_default', label: 'Default surge fee ₹' },
    { key: 'otp_digits', label: 'OTP digits' },
    { key: 'visiting_fee', label: 'Visiting fee ₹' },
    { key: 'payout_threshold', label: 'Monday payout threshold ₹' },
  ];

  return (
    <>
      <PageHeader title="App Settings" subtitle="Global configuration for mobile apps" />
      <ErrorAlert message={error} />
      {saved && <Typography color="success.main" sx={{ mb: 2 }}>Settings saved</Typography>}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {fields.map((f) => (
              <Grid key={f.key} size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={f.label}
                  value={settings[f.key] ?? ''}
                  onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                />
              </Grid>
            ))}
          </Grid>
          <Button variant="contained" sx={{ mt: 3 }} onClick={save}>Save settings</Button>
        </CardContent>
      </Card>
    </>
  );
}
