import { Box, Card, CardActionArea, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { DashboardAlert } from '../../types/dashboard';

const severityColor = {
  critical: { bg: '#FFEBEE', border: '#EF5350', chip: 'error' as const },
  warning: { bg: '#FFF8E1', border: '#FFA726', chip: 'warning' as const },
  info: { bg: '#E3F2FD', border: '#42A5F5', chip: 'info' as const },
};

interface AlertCardProps {
  alert: DashboardAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const navigate = useNavigate();
  const colors = severityColor[alert.severity];

  return (
    <Card
      sx={{
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
      }}
    >
      <CardActionArea onClick={() => navigate(alert.href)} sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              mt: 0.75,
              flexShrink: 0,
              bgcolor: colors.border,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {alert.title}
              </Typography>
              {alert.count != null && alert.count > 0 && (
                <Chip label={alert.count} size="small" color={colors.chip} />
              )}
            </Box>
            {alert.description && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {alert.description}
              </Typography>
            )}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
