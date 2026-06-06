import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Switch,
  FormControlLabel,
  MenuItem,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { NEXGEN_ORANGE } from '../theme';

interface ServiceRow {
  id: string;
  name: string;
  categoryLabel: string;
  categoryId?: string;
  basePrice: number;
  commissionPercent: number;
  isActive?: boolean;
}

interface CategoryRow {
  id: string;
  nameEn: string;
  emoji: string;
  iconUrl?: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  isActive: boolean;
}

const btnRadius = { borderRadius: '12px', fontWeight: 700, px: 2.5 };

export function PricingPage() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [edit, setEdit] = useState<ServiceRow | null>(null);
  const [price, setPrice] = useState('');
  const [commission, setCommission] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [catOpen, setCatOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    nameEn: '',
    emoji: '•',
    iconUrl: '',
    minPrice: '',
    maxPrice: '',
    isActive: true,
  });
  const [svcForm, setSvcForm] = useState({
    categoryId: '',
    name: '',
    basePrice: '',
    commissionPercent: '10',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [services, cats] = await Promise.all([
        adminApi.services() as Promise<ServiceRow[]>,
        adminApi.categories() as Promise<CategoryRow[]>,
      ]);
      setRows(services);
      setCategories(cats);
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
    if (!edit) return;
    try {
      await adminApi.updateService(edit.id, {
        basePrice: Number(price),
        commissionPercent: Number(commission),
      });
      setEdit(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const saveCategory = async () => {
    try {
      await adminApi.createCategory({
        nameEn: catForm.nameEn,
        emoji: catForm.emoji,
        iconUrl: catForm.iconUrl || undefined,
        minPrice: catForm.minPrice ? Number(catForm.minPrice) : undefined,
        maxPrice: catForm.maxPrice ? Number(catForm.maxPrice) : undefined,
        isActive: catForm.isActive,
      });
      setCatOpen(false);
      setCatForm({ nameEn: '', emoji: '•', iconUrl: '', minPrice: '', maxPrice: '', isActive: true });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Category create failed');
    }
  };

  const saveService = async () => {
    try {
      await adminApi.createService({
        categoryId: svcForm.categoryId,
        name: svcForm.name,
        basePrice: Number(svcForm.basePrice),
        commissionPercent: Number(svcForm.commissionPercent),
      });
      setSvcOpen(false);
      setSvcForm({ categoryId: '', name: '', basePrice: '', commissionPercent: '10' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Service create failed');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Service & Pricing Manager"
        subtitle="Categories, price floors/ceilings, and catalog services sync to mobile apps"
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => setCatOpen(true)}
              sx={{
                ...btnRadius,
                bgcolor: '#fff',
                color: '#1A237E',
                borderColor: NEXGEN_ORANGE,
                '&:hover': { borderColor: NEXGEN_ORANGE, bgcolor: '#FFF8F0' },
              }}
            >
              + Add New Category
            </Button>
            <Button
              variant="contained"
              onClick={() => setSvcOpen(true)}
              sx={{ ...btnRadius, bgcolor: NEXGEN_ORANGE, '&:hover': { bgcolor: '#E67E00' } }}
            >
              + Add New Service
            </Button>
          </Stack>
        }
      />
      <ErrorAlert message={error} />

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Categories & Price Limits</Typography>
      <Table size="small" sx={{ mb: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>Min (Floor)</TableCell>
            <TableCell>Max (Ceiling)</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.emoji} {c.nameEn}</TableCell>
              <TableCell>{c.minPrice != null ? `₹${c.minPrice}` : '—'}</TableCell>
              <TableCell>{c.maxPrice != null ? `₹${c.maxPrice}` : '—'}</TableCell>
              <TableCell>
                <Chip label={c.isActive !== false ? 'Active' : 'Inactive'} size="small" color={c.isActive !== false ? 'success' : 'default'} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Catalog Services</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Service</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Base Price</TableCell>
            <TableCell>Commission %</TableCell>
            <TableCell align="right">Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.categoryLabel}</TableCell>
              <TableCell>₹{r.basePrice}</TableCell>
              <TableCell>{r.commissionPercent ?? 10}%</TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => {
                    setEdit(r);
                    setPrice(String(r.basePrice));
                    setCommission(String(r.commissionPercent ?? 10));
                  }}
                >
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!edit} onClose={() => setEdit(null)}>
        <DialogTitle>Edit pricing — {edit?.name}</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 320 }}>
          <TextField fullWidth label="Base Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} margin="dense" />
          <TextField fullWidth label="Commission %" value={commission} onChange={(e) => setCommission(e.target.value)} margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEdit(null)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={catOpen} onClose={() => setCatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Category Name" value={catForm.nameEn} onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })} fullWidth required />
            <TextField label="Emoji / Icon" value={catForm.emoji} onChange={(e) => setCatForm({ ...catForm, emoji: e.target.value })} fullWidth />
            <TextField label="Icon URL (optional)" value={catForm.iconUrl} onChange={(e) => setCatForm({ ...catForm, iconUrl: e.target.value })} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Min Price (₹)" value={catForm.minPrice} onChange={(e) => setCatForm({ ...catForm, minPrice: e.target.value })} fullWidth />
              <TextField label="Max Price (₹)" value={catForm.maxPrice} onChange={(e) => setCatForm({ ...catForm, maxPrice: e.target.value })} fullWidth />
            </Box>
            <FormControlLabel
              control={<Switch checked={catForm.isActive} onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })} />}
              label="Global Visibility (Active)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveCategory}>Create Category</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={svcOpen} onClose={() => setSvcOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Service</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField select label="Parent Category" value={svcForm.categoryId} onChange={(e) => setSvcForm({ ...svcForm, categoryId: e.target.value })} fullWidth required>
              {categories.filter((c) => c.isActive !== false).map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.emoji} {c.nameEn}</MenuItem>
              ))}
            </TextField>
            <TextField label="Service Name" value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} fullWidth required />
            <TextField label="Global Base Price (₹)" value={svcForm.basePrice} onChange={(e) => setSvcForm({ ...svcForm, basePrice: e.target.value })} fullWidth />
            <TextField label="Platform Commission (%)" value={svcForm.commissionPercent} onChange={(e) => setSvcForm({ ...svcForm, commissionPercent: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSvcOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveService}>Create Service</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
