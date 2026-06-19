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
import { validateAdAssetFile, fileToDataUrl } from '../utils/adAssetValidation';

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
    placement: 'home_dashboard',
    targetUrl: '',
    city: '',
    priority: '10',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const onFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isVideo = ext === 'mp4';
    const mediaType = isVideo ? 'video' : 'image';
    const validation = await validateAdAssetFile(file, mediaType);
    if (!validation.ok) {
      setError(validation.errors.join(' '));
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPreviewUrl(dataUrl);
    setForm((f) => ({ ...f, mediaType, mediaUrl: dataUrl }));
    setError(null);
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
        placement: form.placement,
        redirectType: 'external',
        redirectValue: form.targetUrl.trim(),
        city: form.city.trim() || undefined,
        priority: Number(form.priority) || 0,
        isActive: true,
        ctaText: 'Learn more',
      });
      setOpen(false);
      setForm({ title: '', subtitle: '', mediaUrl: '', mediaType: 'image', placement: 'home_dashboard', targetUrl: '', city: '', priority: '10' });
      setPreviewUrl(null);
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
              label="Placement"
              value={form.placement}
              onChange={(e) => setForm({ ...form, placement: e.target.value })}
              fullWidth
            >
              <MenuItem value="home_dashboard">User Home Dashboard</MenuItem>
              <MenuItem value="partner_live_tracking">Partner Tracking / Live Screen</MenuItem>
            </TextField>
            <Box sx={{ p: 2, border: '1px dashed #ff9800', borderRadius: 2, bgcolor: '#fafafa' }}>
              <Typography variant="caption" color="text.secondary">Placement preview</Typography>
              <Box
                sx={{
                  mt: 1,
                  height: form.placement === 'partner_live_tracking' ? 50 : 120,
                  bgcolor: '#eee',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {previewUrl && form.mediaType === 'image' ? (
                  <Box component="img" src={previewUrl} alt="preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : previewUrl && form.mediaType === 'video' ? (
                  <Box component="video" src={previewUrl} muted autoPlay loop sx={{ width: '100%', height: '100%' }} />
                ) : (
                  <Typography variant="caption">Upload asset to preview</Typography>
                )}
              </Box>
            </Box>
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
