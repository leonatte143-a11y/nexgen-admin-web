import { Box, Typography } from '@mui/material';
import type { DashboardAlert } from '../../types/dashboard';
import { DashboardSection } from './DashboardSection';
import { AlertCard } from './AlertCard';

interface UrgentAlertsPanelProps {
  alerts: DashboardAlert[];
}

export function UrgentAlertsPanel({ alerts }: UrgentAlertsPanelProps) {
  const sorted = [...alerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <DashboardSection title="Urgent Action Alerts" subtitle="Priority items requiring attention">
      {sorted.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          All clear — no urgent actions right now.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          {sorted.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </Box>
      )}
    </DashboardSection>
  );
}
