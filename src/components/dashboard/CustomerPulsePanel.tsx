import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';
import type { CustomerPulseData } from '../../types/dashboard';
import { ReviewCard } from './ReviewCard';

interface CustomerPulsePanelProps {
  data: CustomerPulseData;
}

export function CustomerPulsePanel({ data }: CustomerPulsePanelProps) {
  const pct = (data.averageRating / 5) * 100;
  const meterColor = data.averageRating >= 4 ? 'success' : data.averageRating >= 3 ? 'warning' : 'error';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Customer Pulse
        </Typography>
        <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary">
            Average rating
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: `${meterColor}.main` }}>
              {data.averageRating.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              / 5.0
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            color={meterColor}
            sx={{ mt: 1, height: 8, borderRadius: 4 }}
          />
        </Box>
        {data.reviews.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No reviews yet. Reviews appear when customers rate completed bookings.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {data.reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
