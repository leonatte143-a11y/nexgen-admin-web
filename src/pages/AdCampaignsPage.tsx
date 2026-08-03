import { useEffect, useMemo, useState } from 'react';
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
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { PlacementPreviewContainer } from '../components/PlacementPreviewContainer';
import { GeoFenceMapField, type LatLng } from '../components/GeoFenceMapField';
import { KAIRO_ORANGE } from '../theme';
import {
  AD_ASSET_SPECS,
  type AdPlacement,
  validateAdAssetFile,
  fileToDataUrl,
} from '../utils/adAssetValidation';

type BannerRow = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mediaType?: string;
  mediaUrl?: string;
  placement?: string;
  redirectType: string;
  redirectValue?: string;
  geoFence?: LatLng[] | null;
  isActive?: boolean;
  priority?: number;
  displayOrder?: number;
};

const PLACEMENT_LABELS: Record<string, string> = {
  home_dashboard: 'Home Dashboard',
  partner_live_tracking: 'Partner Live Map',
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
    mediaType: 'image' as 'image' | 'video',
    placement: 'home_dashboard' as AdPlacement,
    targetUrl: '',
    city: '',
    priority: '10',
  });
  const [geoFence, setGeoFence] = useState<LatLng[] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [assetValid, setAssetValid] = useState(false);
  const [assetErrors, setAssetErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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

  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      mediaUrl: '',
      mediaType: 'image',
      placement: 'home_dashboard',
      targetUrl: '',
      city: '',
      priority: '10',
    });
    setGeoFence(null);
    setPreviewUrl(null);
    setAssetValid(false);
    setAssetErrors([]);
  };

  const onFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mediaType = ext === 'mp4' ? 'video' : 'image';
    const validation = await validateAdAssetFile(file, mediaType);
    setAssetErrors(validation.errors);
    setAssetValid(validation.ok);
    if (!validation.ok) {
      setPreviewUrl(null);
      setForm((f) => ({ ...f, mediaType, mediaUrl: '' }));
      setError(validation.errors.join(' '));
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPreviewUrl(dataUrl);
    setForm((f) => ({ ...f, mediaType, mediaUrl: dataUrl }));
    setError(null);
  };

  const canSave = useMemo(
    () => assetValid && Boolean(form.title.trim()) && Boolean(form.mediaUrl.trim()),
    [assetValid, form.title, form.mediaUrl],
  );

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const targetUrl = form.targetUrl.trim();
      await adminApi.createBanner({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        imageUrl: form.mediaUrl.trim(),
        mediaType: form.mediaType,
        placement: form.placement,
        redirectType: targetUrl ? 'external' : 'none',
        redirectValue: targetUrl || undefined,
        city: form.city.trim() || undefined,
        priority: Number(form.priority) || 0,
        isActive: true,
        ctaText: 'Learn more',
        geoFence: geoFence && geoFence.length >= 3 ? geoFence : null,
      });
      setOpen(false);
      resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this ad campaign?')) return;
    try {
      await adminApi.deleteBanner(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Ad Campaigns"
        subtitle="Upload poster/video assets, draw a geo-fence, and queue sequential in-app delivery"
        action={
          <Button
            variant="contained"
            sx={{ bgcolor: KAIRO_ORANGE }}
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
          >
            + New Campaign
          </Button>
        }
      />
      <ErrorAlert message={error} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Queue #</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Placement</TableCell>
            <TableCell>Media</TableCell>
            <TableCell>Geo-Fence</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{(b.displayOrder ?? 0) + 1}</TableCell>
              <TableCell>{b.title}</TableCell>
              <TableCell>
                <Chip size="small" label={PLACEMENT_LABELS[b.placement || 'home_dashboard'] || b.placement} />
              </TableCell>
              <TableCell>
                <Chip size="small" label={b.mediaType || 'image'} />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  label={b.geoFence && b.geoFence.length >= 3 ? `Fenced (${b.geoFence.length} pts)` : 'All locations'}
                />
              </TableCell>
              <TableCell>
                <Chip size="small" color={b.isActive ? 'success' : 'default'} label={b.isActive ? 'Live' : 'Inactive'} />
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" color="error" onClick={() => handleDelete(b.id)}>
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
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Media file (.jpg / .png / .mp4)
              </Typography>
              <Button variant="outlined" component="label" sx={{ mt: 0.5, display: 'block' }}>
                Choose file
                <input type="file" hidden accept=".jpg,.jpeg,.png,.mp4,image/jpeg,image/png,video/mp4" onChange={onFilePick} />
              </Button>
              <Box component="table" sx={{ mt: 1.5, width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#f5f5f5' }}>
                    <Box component="th" sx={{ textAlign: 'left', p: 0.75 }}>Asset Type</Box>
                    <Box component="th" sx={{ textAlign: 'left', p: 0.75 }}>Max Size</Box>
                    <Box component="th" sx={{ textAlign: 'left', p: 0.75 }}>Max Duration</Box>
                    <Box component="th" sx={{ textAlign: 'left', p: 0.75 }}>Dimensions</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {AD_ASSET_SPECS.map((row) => (
                    <Box component="tr" key={row.type}>
                      <Box component="td" sx={{ p: 0.75, borderTop: '1px solid #eee' }}>{row.type}</Box>
                      <Box component="td" sx={{ p: 0.75, borderTop: '1px solid #eee' }}>{row.maxSize}</Box>
                      <Box component="td" sx={{ p: 0.75, borderTop: '1px solid #eee' }}>{row.duration}</Box>
                      <Box component="td" sx={{ p: 0.75, borderTop: '1px solid #eee' }}>{row.dimensions}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
              {assetErrors.length > 0 ? (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {assetErrors.join(' ')}
                </Alert>
              ) : assetValid ? (
                <Alert severity="success" sx={{ mt: 1 }}>Asset meets all requirements.</Alert>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Save stays disabled until a compatible file is uploaded.
                </Typography>
              )}
            </Box>
            <TextField
              select
              label="Placement"
              value={form.placement}
              onChange={(e) => setForm({ ...form, placement: e.target.value as AdPlacement })}
              fullWidth
            >
              <MenuItem value="home_dashboard">User Home Dashboard</MenuItem>
              <MenuItem value="partner_live_tracking">Partner Tracking / Live Screen</MenuItem>
            </TextField>
            <PlacementPreviewContainer placement={form.placement} previewUrl={previewUrl} mediaType={form.mediaType} />
            <GeoFenceMapField value={geoFence} onChange={setGeoFence} />
            <TextField
              label="Redirect Destination URL / Social Link (optional)"
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              fullWidth
              placeholder="https://instagram.com/shopname or https://wa.me/919876543210"
              helperText="Opens in the in-app browser when the ad is tapped. Leave blank for no link."
            />
            <TextField label="City (optional)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} fullWidth />
            <TextField label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} fullWidth helperText="Higher priority breaks ties within the queue" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={!canSave || saving} sx={{ bgcolor: canSave ? KAIRO_ORANGE : undefined }}>
            Save campaign
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
