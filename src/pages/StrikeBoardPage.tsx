import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, Stack,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { Can } from '../components/Can';
import { PERMISSIONS } from '../config/rbac';

export function StrikeBoardPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const action = async (id: string, type: 'warn' | 'freeze' | 'block' | 'archive') => {
    const map = {
      warn: () => adminApi.warnPartner(id, 'Policy violation'),
      freeze: () => adminApi.freezePartner(id),
      block: () => adminApi.blockPartner(id),
      archive: () => adminApi.archivePartner(id),
    };
    try {
      await map[type]();
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
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Partner</TableCell>
            <TableCell>Strikes</TableCell>
            <TableCell>Cancellations</TableCell>
            <TableCell>Low Ratings</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={6}>No partners on strike board</TableCell></TableRow>
          )}
          {rows.map((p) => (
            <TableRow key={String(p.id)}>
              <TableCell>{String(p.name)}</TableCell>
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
                  <Stack direction="row" spacing={0.5}>
                    <Button size="small" onClick={() => action(String(p.id), 'warn')}>Warn</Button>
                    <Button size="small" onClick={() => action(String(p.id), 'freeze')}>Freeze</Button>
                    <Button size="small" color="warning" onClick={() => action(String(p.id), 'block')}>Block</Button>
                    <Button size="small" color="error" onClick={() => action(String(p.id), 'archive')}>Archive</Button>
                  </Stack>
                </Can>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
