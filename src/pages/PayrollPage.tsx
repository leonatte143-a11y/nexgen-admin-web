import { useEffect, useState } from 'react';
import {
  Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Typography,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

export function PayrollPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows((await adminApi.staffPayroll()) as Record<string, unknown>[]);
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
      <PageHeader title="Staff Salary Management" subtitle="Admin-only payroll — Manager & HR" />
      <ErrorAlert message={error} />
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => adminApi.calculatePayroll().then(load)}>
        Calculate Monthly Payroll
      </Button>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Staff Name</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Base Salary</TableCell>
              <TableCell>Performance Bonus</TableCell>
              <TableCell>Total Payable</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>No payroll records — run calculate or seed staff profiles</Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={String(r.id)}>
                <TableCell>{String(r.staffName || r.adminUserId)}</TableCell>
                <TableCell>{String(r.designation || (r.meta as { designation?: string } | undefined)?.designation || '—')}</TableCell>
                <TableCell>₹{String(r.baseSalary ?? 0)}</TableCell>
                <TableCell>₹{String(r.performanceBonus ?? 0)}</TableCell>
                <TableCell>₹{String(r.totalPayable ?? 0)}</TableCell>
                <TableCell>{String(r.status)}</TableCell>
                <TableCell><Button size="small" disabled>Pay via UPI</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
