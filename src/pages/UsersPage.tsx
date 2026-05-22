import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Chip } from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

export function UsersPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (search?: string) => {
    setLoading(true);
    try {
      setRows((await adminApi.users(search)) as Record<string, unknown>[]);
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
      <PageHeader title="User Management" />
      <ErrorAlert message={error} />
      <TextField size="small" label="Search users" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(q)} sx={{ mb: 2 }} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Points</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((u) => (
            <TableRow key={String(u.id)}>
              <TableCell>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</TableCell>
              <TableCell>{String(u.phone)}</TableCell>
              <TableCell>{String(u.rewardPoints)}</TableCell>
              <TableCell>{u.isBlocked ? <Chip label="Blocked" color="error" size="small" /> : <Chip label="Active" color="success" size="small" />}</TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => adminApi.blockUser(String(u.id), !u.isBlocked).then(() => load(q))}>
                  {u.isBlocked ? 'Unblock' : 'Block'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
