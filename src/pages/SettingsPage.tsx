import { useEffect, useState } from 'react';
import { Card, CardContent, TextField, Button, Grid, Typography, Tabs, Tab, Box, Stack } from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { NEXGEN_ORANGE } from '../theme';

function GeneralSettingsTab() {
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

function maskPreview(raw: string): string {
  if (!raw) return '';
  if (raw.length <= 10) return '*'.repeat(raw.length);
  return `${raw.slice(0, 6)}...${'*'.repeat(4)}`;
}

function MapsApiKeyTab() {
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await adminApi.mapsKeySetting();
      setMaskedKey(s.maskedKey);
      setHasKey(s.hasKey);
      setUpdatedBy(s.updatedBy);
      setUpdatedAt(s.updatedAt);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!newKey.trim()) return;
    setSaving(true);
    try {
      await adminApi.updateMapsKeySetting(newKey.trim());
      setNewKey('');
      setSaved(true);
      setError(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <ErrorAlert message={error} />
      {saved && <Typography color="success.main" sx={{ mb: 2 }}>Google Maps API key saved</Typography>}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Google Maps API Key
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Stored securely in the backend and fetched by the mobile and web apps at startup — no app rebuild
            required to rotate this key. Only masked here; the raw value is never sent back to the browser.
          </Typography>
          <Stack spacing={2} sx={{ maxWidth: 480 }}>
            <TextField
              label="Current key"
              value={hasKey ? maskedKey ?? '' : 'Not configured'}
              disabled
              fullWidth
            />
            <TextField
              label="New Google Maps API Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="AIzaSy..."
              fullWidth
              helperText={newKey ? `Will be saved as: ${maskPreview(newKey.trim())}` : ' '}
            />
            <Button
              variant="contained"
              sx={{ bgcolor: NEXGEN_ORANGE, alignSelf: 'flex-start' }}
              onClick={save}
              disabled={!newKey.trim() || saving}
            >
              Save key
            </Button>
          </Stack>
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="caption" color="text.secondary">
              Last Updated By: <strong>{updatedBy || '—'}</strong>
              {updatedAt ? ` • ${new Date(updatedAt).toLocaleString()}` : ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export function SettingsPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <PageHeader title="System Settings" subtitle="Global configuration for mobile apps and platform services" />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="General" />
        <Tab label="Maps & Location API" />
      </Tabs>
      {tab === 0 && <GeneralSettingsTab />}
      {tab === 1 && <MapsApiKeyTab />}
    </>
  );
}
