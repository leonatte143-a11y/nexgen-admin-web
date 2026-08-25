import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { KAIRO_ORANGE } from '../theme';

interface RevenueSourceConfig {
  key: 'partner_subscription' | 'ad_campaign';
  categoryId: string;
  title: string;
  priceLabel: string;
}

const SOURCES: RevenueSourceConfig[] = [
  {
    key: 'partner_subscription',
    categoryId: 'partner_subscription',
    title: 'Partner Subscription Revenue',
    priceLabel: 'Subscription Price (₹)',
  },
  {
    key: 'ad_campaign',
    categoryId: 'advertising',
    title: 'Advertise Your Business (Ad Campaigns) Revenue',
    priceLabel: 'Ad Campaign Price (₹)',
  },
];

function settingKeys(source: RevenueSourceConfig) {
  return {
    price: `${source.key}_price`,
    offerPercent: `${source.key}_offer_percent`,
    offerCode: `${source.key}_offer_code`,
    paymentLink: `${source.key}_payment_link`,
  };
}

export function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [amountsByCategory, setAmountsByCategory] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<Record<string, string | number>>({});
  const [editSource, setEditSource] = useState<RevenueSourceConfig | null>(null);
  const [form, setForm] = useState({ price: '', offerPercent: '', offerCode: '', paymentLink: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [breakdown, s] = await Promise.all([adminApi.financialBreakdown(), adminApi.settings()]);
      setTotalRevenue(breakdown.totalRevenue);
      const byCategory: Record<string, number> = {};
      for (const c of breakdown.categories) byCategory[c.id] = c.amount;
      setAmountsByCategory(byCategory);
      setSettings(s as Record<string, string | number>);
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

  const openEdit = (source: RevenueSourceConfig) => {
    const keys = settingKeys(source);
    setForm({
      price: String(settings[keys.price] ?? ''),
      offerPercent: String(settings[keys.offerPercent] ?? ''),
      offerCode: String(settings[keys.offerCode] ?? ''),
      paymentLink: String(settings[keys.paymentLink] ?? ''),
    });
    setEditSource(source);
  };

  const saveEdit = async () => {
    if (!editSource) return;
    const keys = settingKeys(editSource);
    try {
      await adminApi.updateSettings({
        [keys.price]: Number(form.price) || 0,
        [keys.offerPercent]: Number(form.offerPercent) || 0,
        [keys.offerCode]: form.offerCode.trim(),
        [keys.paymentLink]: form.paymentLink.trim(),
      });
      setEditSource(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Revenue & Payments"
        subtitle="Overall platform revenue and admin-editable pricing, offers & payment links per source"
      />
      <ErrorAlert message={error} />

      <Card sx={{ mb: 3, bgcolor: KAIRO_ORANGE, color: '#fff' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>Overall Total Revenue</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>₹{totalRevenue.toLocaleString('en-IN')}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {SOURCES.map((source) => (
          <Grid key={source.key} size={{ xs: 12, sm: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{source.title}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                  ₹{(amountsByCategory[source.categoryId] || 0).toLocaleString('en-IN')}
                </Typography>
                <Button variant="outlined" onClick={() => openEdit(source)} sx={{ borderRadius: '12px', fontWeight: 700 }}>
                  Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!editSource} onClose={() => setEditSource(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{editSource?.title} — Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label={editSource?.priceLabel}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              fullWidth
            />
            <TextField
              label="Offer / Discount %"
              value={form.offerPercent}
              onChange={(e) => setForm({ ...form, offerPercent: e.target.value })}
              fullWidth
            />
            <TextField
              label="Offer Code"
              value={form.offerCode}
              onChange={(e) => setForm({ ...form, offerCode: e.target.value })}
              fullWidth
            />
            <TextField
              label="Payment Gateway Link (e.g. Razorpay/Stripe)"
              value={form.paymentLink}
              onChange={(e) => setForm({ ...form, paymentLink: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditSource(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
