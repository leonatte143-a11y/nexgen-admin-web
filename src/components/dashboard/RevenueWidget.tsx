import { Box, Card, CardContent, Typography } from '@mui/material';
import type { RevenueCategory } from '../../types/dashboard';
import { formatInr, formatPct } from '../../utils/format';

interface RevenueWidgetProps {
  category: RevenueCategory;
}

export function RevenueWidget({ category }: RevenueWidgetProps) {
  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {category.label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
          {formatInr(category.amount)}
        </Typography>
        {category.trendPct != null && (
          <Typography
            variant="caption"
            sx={{ color: category.trendPct >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}
          >
            {formatPct(category.trendPct)} vs last month
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface FinancialPipelineProps {
  totalRevenue: number;
  pendingPayouts: number;
  escrowBalance: number;
  totalCommissionEarned: number;
  revenueToday: number;
  categories: RevenueCategory[];
}

export function FinancialPipeline({
  totalRevenue,
  pendingPayouts,
  escrowBalance,
  totalCommissionEarned,
  revenueToday,
  categories,
}: FinancialPipelineProps) {
  const kpis = [
    { label: 'Total Revenue', value: totalRevenue, highlight: true },
    { label: 'Pending Payouts', value: pendingPayouts },
    { label: 'Escrow Balance', value: escrowBalance },
    { label: 'Commission Earned', value: totalCommissionEarned, sub: `Today: ${formatInr(revenueToday)}` },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        {kpis.map((k) => (
          <Card
            key={k.label}
            sx={{
              background: k.highlight
                ? 'linear-gradient(135deg, #FF8C00 0%, #E67E00 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #F5F6F8 100%)',
              color: k.highlight ? '#fff' : 'text.primary',
              border: k.highlight ? 'none' : undefined,
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" sx={{ opacity: k.highlight ? 0.9 : undefined, color: k.highlight ? '#fff' : 'text.secondary' }}>
                {k.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: k.highlight ? '#fff' : 'text.primary' }}>
                {formatInr(k.value)}
              </Typography>
              {k.sub && (
                <Typography variant="caption" sx={{ opacity: 0.85, color: k.highlight ? '#fff' : 'text.secondary' }}>
                  {k.sub}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
      {categories.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No revenue categories recorded yet.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {categories.map((c) => (
            <RevenueWidget key={c.id} category={c} />
          ))}
        </Box>
      )}
    </Box>
  );
}
