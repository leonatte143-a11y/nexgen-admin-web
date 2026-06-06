import { useCallback, useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Typography,
  TextField, MenuItem, Stack, Button,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

interface AuditRow {
  id: string;
  timestamp: string;
  role: string;
  staffName: string;
  actionTaken: string;
  ipAddress: string | null;
  location: string | null;
}

const ROLE_FILTERS = ['', 'admin', 'manager', 'hr', 'marketing', 'client_support', 'recruitment_exec'];
const PAGE_SIZE = 50;

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        limit: String(PAGE_SIZE),
        offset: String(offset),
      };
      if (roleFilter) params.role = roleFilter;
      if (actionFilter) params.action = actionFilter;
      const data = await adminApi.auditLogs(params);
      setRows((data.items || []) as AuditRow[]);
      setTotal(data.total || 0);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [offset, roleFilter, actionFilter]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && rows.length === 0) return <LoadingState />;
  return (
    <>
      <PageHeader title="Audit Monitor" subtitle="Read-only activity log for all staff actions" />
      <ErrorAlert message={error} />
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField select size="small" label="Role" value={roleFilter} onChange={(e) => { setOffset(0); setRoleFilter(e.target.value); }} sx={{ minWidth: 160 }}>
          <MenuItem value="">All roles</MenuItem>
          {ROLE_FILTERS.filter(Boolean).map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" label="Action filter" value={actionFilter} onChange={(e) => { setOffset(0); setActionFilter(e.target.value); }} sx={{ minWidth: 200 }} />
        <Button variant="outlined" onClick={() => load()}>Refresh</Button>
      </Stack>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No audit entries match your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{new Date(r.timestamp).toLocaleString()}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell>{r.staffName}</TableCell>
                <TableCell>{r.actionTaken}</TableCell>
                <TableCell>{r.ipAddress || '—'}</TableCell>
                <TableCell>{r.location || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
        <Button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>Previous</Button>
        <Typography variant="body2" color="text.secondary">
          Showing {offset + 1}–{offset + rows.length} of {total}
        </Typography>
        <Button disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)}>Next</Button>
      </Stack>
    </>
  );
}
