import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

interface KycRow {
  id: string;
  name: string;
  phone: string;
  categories: string[];
  verificationStatus: string;
  documents: { docType: string; fileUrl: string }[];
}

export function KycPage() {
  const [rows, setRows] = useState<KycRow[]>([]);
  const [selected, setSelected] = useState<KycRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows((await adminApi.pendingKyc()) as KycRow[]);
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

  const act = async (id: string, approve: boolean) => {
    try {
      if (approve) await adminApi.approveKyc(id);
      else await adminApi.rejectKyc(id, 'Documents unclear');
      setSelected(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  if (loading) return <LoadingState />;
  return (
    <>
      <PageHeader title="Partner Verification Hub" subtitle="Approve KYC before partners can earn" />
      <ErrorAlert message={error} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Partner</TableCell>
            <TableCell>Service</TableCell>
            <TableCell>Documents</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>{r.name}<br /><Typography variant="caption">{r.phone}</Typography></TableCell>
              <TableCell>{(r.categories || []).join(', ')}</TableCell>
              <TableCell>{r.documents?.length || 0} files</TableCell>
              <TableCell><Chip label={r.verificationStatus} size="small" color="warning" /></TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => setSelected(r)}>Review</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <DialogTitle>{selected.name} — KYC Review</DialogTitle>
            <DialogContent>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {selected.documents?.map((d) => (
                  <Box key={d.docType}>
                    <Typography variant="caption">{d.docType}</Typography>
                    <Box
                      component="img"
                      src={d.fileUrl}
                      alt={d.docType}
                      sx={{ maxWidth: 280, borderRadius: 1, border: '1px solid #eee', display: 'block' }}
                    />
                  </Box>
                ))}
              </Stack>
              <Stack direction="row" sx={{ gap: 1 }}>
                <Button variant="contained" color="success" onClick={() => act(selected.id, true)}>Approve</Button>
                <Button variant="contained" color="error" onClick={() => act(selected.id, false)}>Reject</Button>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}
