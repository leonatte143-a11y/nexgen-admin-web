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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

interface ServiceRow {
  id: string;
  name: string;
  categoryLabel: string;
  basePrice: number;
  commissionPercent: number;
}

export function PricingPage() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [edit, setEdit] = useState<ServiceRow | null>(null);
  const [price, setPrice] = useState('');
  const [commission, setCommission] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows((await adminApi.services()) as ServiceRow[]);
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

  if (loading) return <LoadingState />;
  return (
    <>
      <PageHeader title="Service & Pricing Manager" subtitle="Changes sync to mobile apps via API" />
      <ErrorAlert message={error} />
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
    </>
  );
}
