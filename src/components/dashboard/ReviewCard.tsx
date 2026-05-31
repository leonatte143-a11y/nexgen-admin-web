import { Box, Card, CardContent, Rating, Typography } from '@mui/material';
import type { ReviewPulseItem } from '../../types/dashboard';

const sentimentStyles = {
  positive: { border: '#A5D6A7', bg: '#F1F8E9' },
  negative: { border: '#EF9A9A', bg: '#FFEBEE' },
  neutral: { border: '#FFE082', bg: '#FFFDE7' },
};

interface ReviewCardProps {
  review: ReviewPulseItem;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const style = sentimentStyles[review.sentiment];
  const lowRating = review.rating < 4;

  return (
    <Card
      sx={{
        border: `1px solid ${style.border}`,
        bgcolor: style.bg,
        outline: lowRating ? '2px solid #EF5350' : 'none',
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {review.customerName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Partner: {review.partnerName}
            </Typography>
          </Box>
          <Rating value={review.rating} readOnly size="small" />
        </Box>
        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }} color="text.secondary">
          &ldquo;{review.comment}&rdquo;
        </Typography>
      </CardContent>
    </Card>
  );
}
