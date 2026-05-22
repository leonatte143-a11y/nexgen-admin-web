import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Chip } from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

export function SupportPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows((await adminApi.tickets()) as Record<string, unknown>[]);
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

  if (loading) return <LoadingState />;
  return (
    <>
      <PageHeader title="Dispute & Support Desk" />
      <ErrorAlert message={error} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Subject</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Frozen</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((t) => (
            <TableRow key={String(t.id)}>
              <TableCell>{String(t.subject)}</TableCell>
              <TableCell><Chip size="small" label={String(t.status)} /></TableCell>
              <TableCell>{t.paymentFrozen ? 'Yes' : 'No'}</TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => adminApi.freezePayment(String(t.id)).then(load)}>Freeze</Button>
                <Button size="small" color="secondary" onClick={() => adminApi.refund(String(t.id)).then(load)}>Refund</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
