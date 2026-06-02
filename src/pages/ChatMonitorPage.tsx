import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Typography, Chip,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

export function ChatMonitorPage() {
  const [chats, setChats] = useState<Record<string, unknown>[]>([]);
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, a] = await Promise.all([adminApi.chats(), adminApi.chatAlerts()]);
        setChats(c as Record<string, unknown>[]);
        setAlerts(a as Record<string, unknown>[]);
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
      <PageHeader title="Super Chat Control Center" subtitle="Read-only monitor — TalkJS/Stream integration future-ready" />
      <ErrorAlert message={error} />
      <Typography variant="h6" sx={{ mb: 1 }}>Keyword Alerts</Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Keyword</TableCell>
              <TableCell>Snippet</TableCell>
              <TableCell>When</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.length === 0 && (
              <TableRow><TableCell colSpan={3}><Typography color="text.secondary">No flagged messages</Typography></TableCell></TableRow>
            )}
            {alerts.map((a) => (
              <TableRow key={String(a.messageId)}>
                <TableCell><Chip label={String(a.keyword)} color="warning" size="small" /></TableCell>
                <TableCell>{String(a.snippet)}</TableCell>
                <TableCell>{a.createdAt ? new Date(String(a.createdAt)).toLocaleString() : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ mb: 1 }}>Active Conversations</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Last Message</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chats.length === 0 && (
              <TableRow><TableCell colSpan={4}><Typography color="text.secondary">No active chats</Typography></TableCell></TableRow>
            )}
            {chats.map((c) => (
              <TableRow key={String(c.id)}>
                <TableCell>{String(c.id)}</TableCell>
                <TableCell>{String(c.channel || 'customer')}</TableCell>
                <TableCell>{String(c.lastMessage || '—').slice(0, 80)}</TableCell>
                <TableCell>{String(c.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
