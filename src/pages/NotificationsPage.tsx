import { useCallback, useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { ErrorAlert } from '../components/ErrorAlert';

type CampaignRow = {
  id: string;
  title: string;
  body: string;
  type: string;
  totalSent: number;
  delivered: number;
  isActive: boolean;
  statusLabel: string;
  createdAt: string;
};

export function NotificationsPage() {
  const [tab, setTab] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('offer');
  const [audience, setAudience] = useState('all_users');
  const [expiresAt, setExpiresAt] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [hubLoading, setHubLoading] = useState(false);

  const loadHub = useCallback(async () => {
    setHubLoading(true);
    try {
      setCampaigns((await adminApi.notificationCampaigns()) as CampaignRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notification hub');
    } finally {
      setHubLoading(false);
    }
  }, []);

  const send = async () => {
    try {
      const res = await adminApi.broadcast({
        title,
        body,
        city: city || undefined,
        type,
        audience,
        expiresAt: expiresAt || undefined,
      });
      setMsg(`Sent to ${(res as { sent: number }).sent} users`);
      setError(null);
      if (tab === 1) loadHub();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    }
  };

  return (
    <>
      <PageHeader title="Notification Management" subtitle="Broadcast messages and review delivery history" />
      <Tabs value={tab} onChange={(_, v) => { setTab(v); if (v === 1) loadHub(); }} sx={{ mb: 2 }}>
        <Tab label="Send broadcast" />
        <Tab label="Notification Hub" />
      </Tabs>
      <ErrorAlert message={error} />
      {msg && <Typography color="success.main" sx={{ mb: 2 }}>{msg}</Typography>}

      {tab === 0 ? (
        <Card>
          <CardContent>
            <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" />
            <TextField fullWidth multiline rows={3} label="Message" value={body} onChange={(e) => setBody(e.target.value)} margin="normal" />
            <TextField fullWidth label="City (optional)" value={city} onChange={(e) => setCity(e.target.value)} margin="normal" />
            <TextField select fullWidth label="Type" value={type} onChange={(e) => setType(e.target.value)} margin="normal">
              <MenuItem value="offer">Offer (Promotional)</MenuItem>
              <MenuItem value="alert">Live / Urgent alert</MenuItem>
              <MenuItem value="order">Booking update</MenuItem>
            </TextField>
            <TextField select fullWidth label="Target audience" value={audience} onChange={(e) => setAudience(e.target.value)} margin="normal">
              <MenuItem value="all_users">All Users</MenuItem>
              <MenuItem value="partners">Service Partners</MenuItem>
              <MenuItem value="shops">Shops</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="datetime-local"
              label="Set expiration (optional)"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              margin="normal"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button variant="contained" onClick={send} sx={{ mt: 2 }}>Broadcast</Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {hubLoading ? <Typography sx={{ p: 2 }}>Loading…</Typography> : null}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Total sent</TableCell>
                <TableCell>Delivered</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sent at</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={c.type === 'live' ? 'Live' : 'Offers'}
                      color={c.type === 'live' ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{c.totalSent}</TableCell>
                  <TableCell>{c.delivered}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={c.isActive ? 'Active / Live' : 'Completed'}
                      color={c.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {!hubLoading && campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No campaigns logged yet</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  );
}
