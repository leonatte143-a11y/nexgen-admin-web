import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { Can } from '../components/Can';
import { PERMISSIONS } from '../config/rbac';

const WARN_REASONS = ['Late Arrival', 'Unprofessional Attire', 'Poor Review', 'Policy Violation', 'Other'];

export function StrikeBoardPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnOpen, setWarnOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState<'block' | 'archive' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [warnReason, setWarnReason] = useState(WARN_REASONS[0]);
  const [warnMessage, setWarnMessage] = useState('');
  const [freezeDays, setFreezeDays] = useState('7');
  const [suggestFreeze, setSuggestFreeze] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows((await adminApi.strikeBoard()) as Record<string, unknown>[]);
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

  const runWarn = async () => {
    if (!selectedId) return;
    const reason = warnMessage.trim() || warnReason;
    try {
      const res = await adminApi.warnPartner(selectedId, reason) as { suggestFreeze?: boolean };
      setSuggestFreeze(Boolean(res?.suggestFreeze));
      setWarnOpen(false);
      setWarnMessage('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  const runFreeze = async () => {
    if (!selectedId) return;
    try {
      await adminApi.freezePartner(selectedId, Number(freezeDays) || 7);
      setFreezeOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  const runConfirm = async () => {
    if (!selectedId || !confirmOpen) return;
    try {
      if (confirmOpen === 'block') await adminApi.blockPartner(selectedId);
      else await adminApi.archivePartner(selectedId);
      setConfirmOpen(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  if (loading) return <LoadingState />;
  return (
    <>
      <PageHeader title="Partner Strike Board" subtitle="Quality management & compliance actions" />
      <ErrorAlert message={error} />
      {suggestFreeze && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setSuggestFreeze(false)}>
          Partner has 3+ warnings. Consider freezing the account.
        </Alert>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Partner</TableCell>
            <TableCell>Warnings</TableCell>
            <TableCell>Strikes</TableCell>
            <TableCell>Cancellations</TableCell>
            <TableCell>Low Ratings</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={7}>No partners on strike board</TableCell></TableRow>
          )}
          {rows.map((p) => (
            <TableRow key={String(p.id)}>
              <TableCell>{String(p.name)}</TableCell>
              <TableCell>{String(p.warningCount ?? 0)}</TableCell>
              <TableCell>{String(p.strikeCount)}</TableCell>
              <TableCell>{String(p.cancellations)}</TableCell>
              <TableCell>{String(p.lowRatings)}</TableCell>
              <TableCell>
                {p.isBlocked ? <Chip label="Blocked" color="error" size="small" /> :
                  p.isFrozen ? <Chip label="Frozen" color="warning" size="small" /> :
                  <Chip label={String(p.accountStatus || 'active')} size="small" />}
              </TableCell>
              <TableCell>
                <Can permission={PERMISSIONS.PARTNERS_COMPLIANCE}>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    <Button size="small" onClick={() => { setSelectedId(String(p.id)); setWarnOpen(true); }}>Warn</Button>
                    <Button size="small" onClick={() => { setSelectedId(String(p.id)); setFreezeOpen(true); }}>Freeze</Button>
                    <Button size="small" color="warning" onClick={() => { setSelectedId(String(p.id)); setConfirmOpen('block'); }}>Block</Button>
                    <Button size="small" color="error" onClick={() => { setSelectedId(String(p.id)); setConfirmOpen('archive'); }}>Archive</Button>
                  </Stack>
                </Can>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={warnOpen} onClose={() => setWarnOpen(false)}>
        <DialogTitle>Send Warning</DialogTitle>
        <DialogContent sx={{ minWidth: 360, pt: 1 }}>
          <TextField select fullWidth label="Reason" value={warnReason} onChange={(e) => setWarnReason(e.target.value)} margin="dense">
            {WARN_REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Custom message (optional)" value={warnMessage} onChange={(e) => setWarnMessage(e.target.value)} margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarnOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={runWarn}>Send Warning</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={freezeOpen} onClose={() => setFreezeOpen(false)}>
        <DialogTitle>Freeze Account</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 1 }}>
          <TextField
            fullWidth
            type="number"
            label="Freeze for (days)"
            value={freezeDays}
            onChange={(e) => setFreezeDays(e.target.value)}
            margin="dense"
            slotProps={{ htmlInput: { min: 1, max: 90 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFreezeOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={runFreeze}>Freeze Partner</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)}>
        <DialogTitle>{confirmOpen === 'block' ? 'Block Partner?' : 'Archive Partner?'}</DialogTitle>
        <DialogContent>
          {confirmOpen === 'block'
            ? 'Partner will be suspended and cannot log in.'
            : 'Partner will be soft-deleted from the live pool (data retained for audit).'}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={runConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
