import {
  Box,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { PartnerPerformanceRow } from '../../types/dashboard';
import { PartnerScoreCard } from './PartnerScoreCard';
import { DashboardSection } from './DashboardSection';
import { formatInr } from '../../utils/format';

interface PartnerPerformancePanelProps {
  topByJobs: PartnerPerformanceRow[];
  topByRating: PartnerPerformanceRow[];
}

function PartnerTable({ rows, emptyLabel }: { rows: PartnerPerformanceRow[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        {emptyLabel}
      </Typography>
    );
  }
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Partner</TableCell>
          <TableCell>Rating</TableCell>
          <TableCell>Completed Jobs</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Earnings</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((p, i) => (
          <TableRow key={p.id} hover>
            <TableCell>{i + 1}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
            <TableCell>★ {p.rating.toFixed(1)}</TableCell>
            <TableCell>{p.completedJobs}</TableCell>
            <TableCell>
              <Chip label={p.status} size="small" color={p.status === 'Verified' ? 'success' : 'default'} />
            </TableCell>
            <TableCell align="right">{formatInr(p.earnings)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function PartnerPerformancePanel({ topByJobs, topByRating }: PartnerPerformancePanelProps) {
  const [tab, setTab] = useState(0);
  const cards = tab === 0 ? topByJobs : topByRating;
  const tableRows = tab === 0 ? topByJobs : topByRating;

  return (
    <DashboardSection
      title="Partner Performance Snapshot"
      subtitle="Live leaderboard from partner records"
    >
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Top by completed jobs" />
        <Tab label="Top by rating" />
      </Tabs>
      {cards.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 2,
          }}
        >
          {cards.slice(0, 3).map((p, i) => (
            <PartnerScoreCard key={p.id} partner={p} rank={i + 1} />
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No partners in database yet.
        </Typography>
      )}
      <Card>
        <CardContent sx={{ overflowX: 'auto' }}>
          <PartnerTable
            rows={tableRows}
            emptyLabel={tab === 0 ? 'No job data yet' : 'No rating data yet'}
          />
        </CardContent>
      </Card>
    </DashboardSection>
  );
}
