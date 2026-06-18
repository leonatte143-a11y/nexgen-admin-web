import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { NEXGEN_ORANGE } from '../theme';

type BannerRow = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mediaType?: string;
  mediaUrl?: string;
  redirectType: string;
  redirectValue?: string;
  isActive?: boolean;
  priority?: number;
};

export function AdCampaignsPage() {
  const [rows, setRows] = useState<BannerRow[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    mediaUrl: '',
    mediaType: 'image',
    targetUrl: '',
    city: '',
    priority: '10',
  });

  const load = async () => {
    setLoading(true);
    try {
      setRows((await adminApi.banners()) as BannerRow[]);
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

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isVideo = ext === 'mp4';
    const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
    if (!isVideo && !isImage) {
      setError('Use .jpg, .png, or .mp4 files. Paste a hosted URL after upload.');
      return;
    }
    setForm((f) => ({
      ...f,
      mediaType: isVideo ? 'video' : 'image',
    }));
    setError(`Selected ${file.name}. Paste the hosted media URL below (CDN / server link).`);
  };

  const save = async () => {
    if (!form.title.trim() || !form.mediaUrl.trim() || !form.targetUrl.trim()) {
      setError('Title, media URL, and target URL are required.');
      return;
    }
    try {
      await adminApi.createBanner({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        imageUrl: form.mediaUrl.trim(),
        mediaType: form.mediaType,
        redirectType: 'external',
        redirectValue: form.targetUrl.trim(),
        city: form.city.trim() || undefined,
        priority: Number(form.priority) || 0,
        isActive: true,
        ctaText: 'Learn more',
      });
      setOpen(false);
      setForm({ title: '', subtitle: '', mediaUrl: '', mediaType: 'image', targetUrl: '', city: '', priority: '10' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Ad Campaigns"
        subtitle="Upload poster/video assets and set destination links for in-app banners"
        action={
          <Button variant="contained" sx={{ bgcolor: NEXGEN_ORANGE }} onClick={() => setOpen(true)}>
            + New Campaign
          </Button>
        }
      />
      <ErrorAlert message={error} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Media</TableCell>
            <TableCell>Target URL</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.title}</TableCell>
              <TableCell>
                <Chip size="small" label={b.mediaType || 'image'} />
              </TableCell>
              <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {b.redirectValue || '—'}
              </TableCell>
              <TableCell>
                <Chip size="small" color={b.isActive ? 'success' : 'default'} label={b.isActive ? 'Live' : 'Inactive'} />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  color="error"
                  onClick={async () => {
                    if (!window.confirm('Delete this ad campaign?')) return;
                    await adminApi.deleteBanner(b.id);
                    load();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Ad Campaign</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Campaign title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth required />
            <TextField label="Subtitle (optional)" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} fullWidth />
            <Box>
              <Typography variant="caption" color="text.secondary">Media file (.jpg / .png / .mp4)</Typography>
              <Button variant="outlined" component="label" sx={{ mt: 0.5, display: 'block' }}>
                Choose file
                <input type="file" hidden accept=".jpg,.jpeg,.png,.mp4,image/*,video/mp4" onChange={onFilePick} />
              </Button>
            </Box>
            <TextField
              select
              label="Media type"
              value={form.mediaType}
              onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
              fullWidth
            >
              <MenuItem value="image">Image poster</MenuItem>
              <MenuItem value="video">Video (.mp4)</MenuItem>
            </TextField>
            <TextField
              label="Media URL (required)"
              value={form.mediaUrl}
              onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
              fullWidth
              required
              helperText="Public URL to your hosted image or video"
            />
            <TextField
              label="Target URL (required)"
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              fullWidth
              required
              helperText="Website or deep link opened in in-app browser when tapped"
            />
            <TextField label="City (optional)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} fullWidth />
            <TextField label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save campaign</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
