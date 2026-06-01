import { useEffect, useState } from 'react';
import {
  Button, Card, CardContent, Grid, List, ListItem, ListItemText, Typography,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { Can } from '../components/Can';
import { PERMISSIONS } from '../config/rbac';

interface Summary {
  topKeywords: { keyword: string; searches: number }[];
  topLocations: { location: string; searches: number }[];
  zeroResultSearches: {
    id: string;
    keyword: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
  }[];
}

export function DemandAnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setSummary((await adminApi.demandSummary()) as Summary);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const establish = async (row: Summary['zeroResultSearches'][0]) => {
    try {
      await adminApi.establishZone({
        city: row.location || row.keyword,
        area: row.keyword,
        latitude: row.latitude ?? undefined,
        longitude: row.longitude ?? undefined,
      });
      setMsg(`Established zone for ${row.location || row.keyword}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Establish failed');
    }
  };

  if (loading) return <LoadingState />;
  return (
    <>
      <PageHeader title="Search Analytics / Market Gap" subtitle="Demand signals from user searches" />
      <ErrorAlert message={error} />
      {msg && <Typography color="success.main" sx={{ mb: 2 }}>{msg}</Typography>}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Keywords</Typography>
              <List dense>
                {(summary?.topKeywords || []).map((k) => (
                  <ListItem key={k.keyword}>
                    <ListItemText primary={k.keyword} secondary={`${k.searches} searches`} />
                  </ListItem>
                ))}
                {!summary?.topKeywords?.length && <Typography color="text.secondary">No data yet</Typography>}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Locations</Typography>
              <List dense>
                {(summary?.topLocations || []).map((l) => (
                  <ListItem key={l.location}>
                    <ListItemText primary={l.location} secondary={`${l.searches} searches`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Zero-Result Searches</Typography>
              <List dense>
                {(summary?.zeroResultSearches || []).map((z) => (
                  <ListItem
                    key={z.id}
                    secondaryAction={
                      <Can permission={PERMISSIONS.ESTABLISH_LOCATION}>
                        <Button size="small" onClick={() => establish(z)}>Establish Location</Button>
                      </Can>
                    }
                  >
                    <ListItemText
                      primary={z.keyword}
                      secondary={`${z.location || 'Unknown'} · ${new Date(z.createdAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
                {!summary?.zeroResultSearches?.length && (
                  <Typography color="text.secondary">No unmet demand recorded</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
