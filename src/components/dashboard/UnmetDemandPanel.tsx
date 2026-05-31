import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import type { UnmetDemandItem } from '../../types/dashboard';
import { RECRUIT_MESSAGE_TEMPLATES } from '../../mock/dashboardMock';
import { buildRecruitMessage, buildWhatsAppUrl } from '../../utils/format';

interface UnmetDemandPanelProps {
  items: UnmetDemandItem[];
  defaultCity?: string;
}

export function UnmetDemandPanel({ items, defaultCity = 'Rajahmundry' }: UnmetDemandPanelProps) {
  const [templateIndex, setTemplateIndex] = useState(0);
  const [snack, setSnack] = useState<string | null>(null);
  const city = defaultCity;

  const getMessage = (keyword: string) => {
    const fn = RECRUIT_MESSAGE_TEMPLATES[templateIndex] ?? buildRecruitMessage;
    return fn(keyword, city);
  };

  const copyMessage = async (keyword: string) => {
    const msg = getMessage(keyword);
    try {
      await navigator.clipboard.writeText(msg);
      setSnack('Message copied to clipboard');
    } catch {
      setSnack('Copy failed — select text manually');
    }
  };

  const openWhatsApp = (keyword: string) => {
    window.open(buildWhatsAppUrl(getMessage(keyword)), '_blank', 'noopener,noreferrer');
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Unmet Demand — Recruitment
          </Typography>
          <Select
            size="small"
            value={templateIndex}
            onChange={(e) => setTemplateIndex(Number(e.target.value))}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value={0}>Standard invite</MenuItem>
            <MenuItem value={1}>High demand</MenuItem>
            <MenuItem value={2}>Trust &amp; bookings</MenuItem>
          </Select>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          City: {city} · Prefilled WhatsApp + copy actions
        </Typography>
        <List dense>
          {items.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No unmet searches yet
            </Typography>
          )}
          {items.map((u) => (
            <ListItem
              key={u.keyword}
              disablePadding
              sx={{
                py: 1,
                flexDirection: 'column',
                alignItems: 'stretch',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                <ListItemText
                  primary={u.keyword}
                  secondary={`${u.searches} searches · ${u.partnersFound} partners found`}
                />
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  <Tooltip title="Copy recruit message">
                    <IconButton size="small" onClick={() => copyMessage(u.keyword)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open WhatsApp">
                    <IconButton size="small" color="success" onClick={() => openWhatsApp(u.keyword)}>
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic', display: 'block' }}>
                {getMessage(u.keyword).slice(0, 80)}…
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
      <Snackbar open={Boolean(snack)} autoHideDuration={3000} message={snack} onClose={() => setSnack(null)} />
    </Card>
  );
}
