import { Avatar, Badge, Box, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import type { ChatThreadPreview } from '../../types/dashboard';

interface ChatPreviewProps {
  threads: ChatThreadPreview[];
  emptyLabel?: string;
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function ChatPreview({ threads, emptyLabel = 'No active chats' }: ChatPreviewProps) {
  if (threads.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        {emptyLabel}
      </Typography>
    );
  }

  return (
    <List dense disablePadding>
      {threads.map((t) => (
        <ListItem key={t.id} disablePadding sx={{ py: 0.75, px: 0 }}>
          <ListItemAvatar sx={{ minWidth: 44 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              color={t.isOnline ? 'success' : 'default'}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: 14 }}>
                {t.participantName.charAt(0)}
              </Avatar>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {t.participantName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(t.updatedAt)}
                </Typography>
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1 }}>
                  {t.lastMessage}
                </Typography>
                {t.unreadCount > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'error.main',
                      color: '#fff',
                      borderRadius: 10,
                      px: 0.75,
                      py: 0.1,
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 18,
                      textAlign: 'center',
                    }}
                  >
                    {t.unreadCount}
                  </Box>
                )}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

interface SupportChatHubProps {
  activeChats: ChatThreadPreview[];
  internalThreads: ChatThreadPreview[];
  provider: string;
}

export function SupportChatHub({ activeChats, internalThreads, provider }: SupportChatHubProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
      }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Customer & Partner Chats
          </Typography>
          <ChatPreview threads={activeChats} />
        </CardContent>
      </Card>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Internal Admin Messaging
          </Typography>
          <ChatPreview threads={internalThreads} emptyLabel="No internal threads" />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
            Chat provider: {provider} — ready for Firebase / TalkJS / Stream integration
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
