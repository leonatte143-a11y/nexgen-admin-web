import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
  Checkbox,
  Box,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

type StaffPayRow = {
  id: string;
  name: string;
  designation?: string;
  baseSalary?: number;
};

export function PayoutsPage() {
  const [tab, setTab] = useState(0);
  const [queue, setQueue] = useState<{
    threshold: number;
    partners: Record<string, unknown>[];
    pendingRequests?: Record<string, unknown>[];
  } | null>(null);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [staffRows, setStaffRows] = useState<StaffPayRow[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [q, h, r, staff] = await Promise.all([
        adminApi.payoutQueue(),
        adminApi.settlementHistory(),
        adminApi.commissionReport(),
        adminApi.listStaff(),
      ]);
      setQueue(q as typeof queue);
      setHistory(h as Record<string, unknown>[]);
      setReport(r as Record<string, unknown>);
      setStaffRows(
        (staff as StaffPayRow[]).filter((s) => Number(s.baseSalary || 0) > 0),
      );
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

  const staffTotal = useMemo(() => {
    return staffRows
      .filter((s) => selectedStaff.has(s.id))
      .reduce((sum, s) => sum + Number(s.baseSalary || 0), 0);
  }, [staffRows, selectedStaff]);

  const generate = async () => {
    try {
      const res = await adminApi.generatePayout();
      setCsv(res.csv);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generate failed');
    }
  };

  const approve = async (id: string) => {
    try {
      await adminApi.approvePayout(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    }
  };

  const reject = async (id: string) => {
    try {
      await adminApi.rejectPayout(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed');
    }
  };

  if (loading) return <LoadingState />;
  return (
    <>
      <PageHeader
        title="Monday Settlement"
        subtitle="Partner payouts and fixed staff payroll"
        action={tab === 0 ? <Button variant="contained" onClick={generate}>Generate Payout File</Button> : undefined}
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Partner Payouts" />
        <Tab label="Staff Payroll" />
      </Tabs>
      <ErrorAlert message={error} />

      {tab === 0 ? (
        <>
          {report && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography>Commission total: ₹{String(report.totalCommission)} · GST est: ₹{String(report.gstEstimate)}</Typography>
                <Typography variant="caption">Partner payout = earnings minus commission</Typography>
              </CardContent>
            </Card>
          )}
          {csv && <Alert severity="success" sx={{ mb: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 11 }}>{csv.slice(0, 500)}…</Alert>}
          {queue?.pendingRequests && queue.pendingRequests.length > 0 ? (
            <>
              <Typography variant="subtitle1" gutterBottom>Partner withdrawal requests (pending approval)</Typography>
              <Table size="small" sx={{ mb: 3 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Partner ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Bank</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queue.pendingRequests.map((p) => (
                    <TableRow key={String(p.id)}>
                      <TableCell>{String(p.partnerId)}</TableCell>
                      <TableCell>₹{String(p.amount)}</TableCell>
                      <TableCell>{String(p.bankName)} {String(p.bankAccount)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => approve(String(p.id))}>Approve</Button>
                        <Button size="small" color="error" onClick={() => reject(String(p.id))}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : null}
          <Typography variant="subtitle1" gutterBottom>Eligible partners (≥ ₹{queue?.threshold})</Typography>
          <Table size="small" sx={{ mb: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>Partner</TableCell>
                <TableCell>Wallet (net earnings)</TableCell>
                <TableCell>Bank</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue?.partners?.map((p) => (
                <TableRow key={String(p.id)}>
                  <TableCell>{String(p.name)}</TableCell>
                  <TableCell>₹{String(p.walletBalance)}</TableCell>
                  <TableCell>{String(p.bankName)} {String(p.bankAccount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="subtitle1" gutterBottom>Settlement history</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Partner</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((s) => (
                <TableRow key={String(s.id)}>
                  <TableCell>{String(s.partnerId)}</TableCell>
                  <TableCell>₹{String(s.amount)}</TableCell>
                  <TableCell>{String(s.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fixed-salary staff only. Select employees for bulk payroll — total uses base salary (no commission).
          </Typography>
          <Box sx={{ mb: 2, p: 2, bgcolor: '#FFF8F0', borderRadius: 2 }}>
            <Typography sx={{ fontWeight: 800 }}>Bulk payout total: ₹{staffTotal}</Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Staff</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Fixed salary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffRows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedStaff.has(s.id)}
                      onChange={(e) => {
                        setSelectedStaff((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(s.id);
                          else next.delete(s.id);
                          return next;
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.designation || '—'}</TableCell>
                  <TableCell>₹{s.baseSalary}</TableCell>
                </TableRow>
              ))}
              {!staffRows.length ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No fixed-salary staff found</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </>
      )}
    </>
  );
}
