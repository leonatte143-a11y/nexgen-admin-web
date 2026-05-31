import { Avatar, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { PartnerPerformanceRow } from '../../types/dashboard';
import { formatInr } from '../../utils/format';

interface PartnerScoreCardProps {
  partner: PartnerPerformanceRow;
  rank: number;
}

export function PartnerScoreCard({ partner, rank }: PartnerScoreCardProps) {
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: medalColors[rank - 1] ?? 'primary.main', width: 40, height: 40 }}>
            {rank <= 3 ? <EmojiEventsIcon fontSize="small" /> : rank}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
              {partner.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ★ {partner.rating.toFixed(1)} · {partner.completedJobs} jobs
            </Typography>
          </Box>
          {partner.isOnline && <Chip label="Online" size="small" color="success" />}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip label={partner.status} size="small" variant="outlined" />
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {formatInr(partner.earnings)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
