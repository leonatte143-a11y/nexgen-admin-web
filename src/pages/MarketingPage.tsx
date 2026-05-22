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
  TextField,
  DialogActions,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

export function MarketingPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [value, setValue] = useState('50');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows((await adminApi.coupons()) as Record<string, unknown>[]);
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

  const create = async () => {
    await adminApi.createCoupon({ code, discountType: 'flat', discountValue: Number(value), city: 'Rajahmundry' });
    setOpen(false);
    await load();
  };

  if (loading) return <LoadingState />;
  return (
    <>
      <PageHeader title="Marketing & Coupons" action={<Button variant="contained" onClick={() => setOpen(true)}>New Coupon</Button>} />
      <ErrorAlert message={error} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>City</TableCell>
            <TableCell>Used</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={String(c.id)}>
              <TableCell>{String(c.code)}</TableCell>
              <TableCell>₹{String(c.discountValue)}</TableCell>
              <TableCell>{String(c.city || 'All')}</TableCell>
              <TableCell>{String(c.usedCount)}</TableCell>
              <TableCell>{c.active ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create promo</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Code" value={code} onChange={(e) => setCode(e.target.value)} margin="dense" />
          <TextField fullWidth label="Flat discount ₹" value={value} onChange={(e) => setValue(e.target.value)} margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={create}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
