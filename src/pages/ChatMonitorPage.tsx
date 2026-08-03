import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Typography, Chip,
  Box, Stack, List, ListItemButton, ListItemText, TextField, Button, Divider,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { useChatSocket } from '../hooks/useChatSocket';
import { KAIRO_ORANGE } from '../theme';

type Conversation = {
  id: string;
  userId?: string | null;
  partnerId?: string | null;
  bookingId?: string | null;
  channel?: string;
  status: string;
  lastMessage?: string;
  lastMessageAt?: string;
  claimedByAdminId?: string | null;
};

type ChatMessage = {
  id: string;
  conversationId: string;
  senderType: 'user' | 'partner' | 'admin';
  senderId?: string | null;
  message: string;
  createdAt: string;
};

const SENDER_LABEL: Record<string, string> = { user: 'User', partner: 'Partner', admin: 'Admin (you)' };
const SENDER_COLOR: Record<string, string> = { user: '#1976d2', partner: '#2E7D32', admin: KAIRO_ORANGE };

export function ChatMonitorPage() {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected = chats.find((c) => c.id === selectedId) || null;

  const onSocketMessage = useCallback((evt: { conversationId: string; message: Record<string, unknown> }) => {
    setMessages((prev) => {
      if (evt.message?.id && prev.some((m) => m.id === evt.message.id)) return prev;
      return [...prev, evt.message as unknown as ChatMessage];
    });
    setChats((prev) =>
      prev.map((c) =>
        c.id === evt.conversationId ? { ...c, lastMessage: String(evt.message.message || ''), lastMessageAt: String(evt.message.createdAt || '') } : c,
      ),
    );
  }, []);
  const { joinRoom } = useChatSocket(onSocketMessage);

  const loadList = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([adminApi.chats(), adminApi.chatAlerts()]);
      setChats(c as Conversation[]);
      setAlerts(a as Record<string, unknown>[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openConversation = useCallback(
    async (id: string) => {
      setSelectedId(id);
      try {
        const { conversation, messages: msgs } = await adminApi.chat(id);
        if (conversation) setChats((prev) => prev.map((c) => (c.id === id ? { ...c, ...conversation } : c)));
        setMessages(msgs as ChatMessage[]);
        joinRoom(id);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to open conversation');
      }
    },
    [joinRoom],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleJoin = async () => {
    if (!selected) return;
    setJoining(true);
    try {
      const updated = await adminApi.joinChat(selected.id);
      setChats((prev) => prev.map((c) => (c.id === selected.id ? { ...c, ...updated } : c)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join conversation');
    } finally {
      setJoining(false);
    }
  };

  const handleSend = async () => {
    if (!selected || !draft.trim()) return;
    setSending(true);
    try {
      const row = await adminApi.sendChatMessage(selected.id, draft.trim());
      setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row as unknown as ChatMessage]));
      setDraft('');
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Super Chat Control Center"
        subtitle="Live conversations across User, Partner, and Admin — join any thread to assist or resolve disputes"
      />
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
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ minHeight: 480 }}>
        <Paper variant="outlined" sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, overflow: 'auto' }}>
          <List dense disablePadding>
            {chats.length === 0 && (
              <Box sx={{ p: 2 }}><Typography color="text.secondary">No active chats</Typography></Box>
            )}
            {chats.map((c) => (
              <ListItemButton key={c.id} selected={c.id === selectedId} onClick={() => openConversation(c.id)}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {c.bookingId ? `Booking ${c.bookingId}` : c.id}
                      </Typography>
                      {c.claimedByAdminId ? <Chip size="small" label="Joined" color="success" /> : null}
                    </Stack>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {(c.lastMessage || 'No messages yet').slice(0, 60)}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selected ? (
            <Box sx={{ p: 3, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Select a conversation to view messages</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {selected.bookingId ? `Booking ${selected.bookingId}` : selected.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    User: {selected.userId || '—'} · Partner: {selected.partnerId || '—'} · Status: {selected.status}
                  </Typography>
                </Stack>
                <Button
                  variant={selected.claimedByAdminId ? 'outlined' : 'contained'}
                  size="small"
                  sx={{ bgcolor: selected.claimedByAdminId ? undefined : KAIRO_ORANGE }}
                  onClick={handleJoin}
                  disabled={joining || Boolean(selected.claimedByAdminId)}
                >
                  {selected.claimedByAdminId ? 'Joined' : 'Join conversation'}
                </Button>
              </Box>
              <Divider />
              <Box ref={scrollRef} sx={{ flex: 1, overflow: 'auto', p: 1.5, minHeight: 280, maxHeight: 380 }}>
                {messages.length === 0 && <Typography color="text.secondary">No messages yet</Typography>}
                {messages.map((m) => (
                  <Box key={m.id} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: SENDER_COLOR[m.senderType] || 'inherit' }}>
                      {SENDER_LABEL[m.senderType] || m.senderType}
                    </Typography>
                    <Typography variant="body2">{m.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(m.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Divider />
              <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Reply as Admin…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button variant="contained" sx={{ bgcolor: KAIRO_ORANGE }} onClick={handleSend} disabled={sending || !draft.trim()}>
                  Send
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      </Stack>
    </>
  );
}
