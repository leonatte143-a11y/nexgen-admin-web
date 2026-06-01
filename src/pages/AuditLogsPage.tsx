import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Typography,
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

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.auditLogs();
        setRows((data.items || []) as AuditRow[]);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;
  return (
    <>
      <PageHeader title="Audit Monitor" subtitle="Read-only activity log for all staff actions" />
      <ErrorAlert message={error} />
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
                    No audit entries yet. Actions by admin staff will appear here.
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
    </>
  );
}
