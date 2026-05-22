import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, List, ListItem, ListItemText } from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { ErrorAlert } from '../components/ErrorAlert';

export function GeoPage() {
  const [heatmap, setHeatmap] = useState<Record<string, unknown> | null>(null);
  const [zones, setZones] = useState<Record<string, unknown>[]>([]);
  const [city, setCity] = useState('Rajahmundry');
  const [surge, setSurge] = useState('30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminApi.heatmap(), adminApi.geoZones()])
      .then(([h, z]) => {
        setHeatmap(h as Record<string, unknown>);
        setZones(z as Record<string, unknown>[]);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageHeader title="Geo-Fencing & Heatmaps" subtitle="Google Maps integration ready" />
      <ErrorAlert message={error} />
      <Box sx={{ mb: 2, p: 3, bgcolor: '#e3f2fd', borderRadius: 2, minHeight: 240 }}>
        <Typography variant="body2" color="text.secondary">
          Map placeholder — add @react-google-maps/api with VITE_GOOGLE_MAPS_KEY
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Search points: {(heatmap?.searchPoints as unknown[])?.length ?? 0} · Online partners:{' '}
          {(heatmap?.partnerOnline as unknown[])?.length ?? 0}
        </Typography>
      </Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Surge pricing</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField size="small" label="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <TextField size="small" label="Rain/Surge fee ₹" value={surge} onChange={(e) => setSurge(e.target.value)} />
            <Button variant="contained" onClick={() => adminApi.setSurge(city, Number(surge)).catch((e) => setError(e.message))}>
              Apply Surge
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Typography variant="subtitle1">Zones</Typography>
      <List>
        {zones.map((z) => (
          <ListItem key={String(z.id)}>
            <ListItemText primary={String(z.name)} secondary={`${z.city} · surge ₹${z.surgeFee}`} />
          </ListItem>
        ))}
      </List>
    </>
  );
}
