import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

export function PayoutsPage() {
  const [queue, setQueue] = useState<{
    threshold: number;
    partners: Record<string, unknown>[];
    pendingRequests?: Record<string, unknown>[];
  } | null>(null);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [q, h, r] = await Promise.all([
        adminApi.payoutQueue(),
        adminApi.settlementHistory(),
        adminApi.commissionReport(),
      ]);
      setQueue(q as typeof queue);
      setHistory(h as Record<string, unknown>[]);
      setReport(r as Record<string, unknown>);
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
        title="Payout & Settlement"
        subtitle="Monday payout queue — 90/10 split"
        action={<Button variant="contained" onClick={generate}>Generate Payout File</Button>}
      />
      <ErrorAlert message={error} />
      {report && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography>Commission total: ₹{String(report.totalCommission)} · GST est: ₹{String(report.gstEstimate)}</Typography>
            <Typography variant="caption">GST invoice placeholder enabled</Typography>
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
            <TableCell>Wallet</TableCell>
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
  );
}
