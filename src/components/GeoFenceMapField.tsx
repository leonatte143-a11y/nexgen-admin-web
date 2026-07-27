import { useCallback, useState } from 'react';
import { GoogleMap, DrawingManager, Polygon, useJsApiLoader } from '@react-google-maps/api';
import { Box, Button, Stack, Typography, Alert } from '@mui/material';
import { useGoogleMapsKey } from '../hooks/useGoogleMapsKey';

export type LatLng = { lat: number; lng: number };

type Props = {
  value: LatLng[] | null;
  onChange: (polygon: LatLng[] | null) => void;
};

const LIBRARIES: 'drawing'[] = ['drawing'];
const DEFAULT_CENTER = { lat: 17.005, lng: 81.7809 }; // Rajahmundry, AP — matches seeded city defaults
const MAP_STYLE = { width: '100%', height: '320px', borderRadius: 8 };

/** Google Maps drawingManager polygon tool — Admin draws a boundary; only users located
 * within it will see the campaign. Coordinates are saved as the `geoFence` field. */
export function GeoFenceMapField({ value, onChange }: Props) {
  const { apiKey, loading: keyLoading } = useGoogleMapsKey();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries: LIBRARIES,
  });
  const [drawing, setDrawing] = useState(false);

  const onPolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const path = polygon.getPath();
      const points: LatLng[] = [];
      for (let i = 0; i < path.getLength(); i += 1) {
        const p = path.getAt(i);
        points.push({ lat: p.lat(), lng: p.lng() });
      }
      onChange(points);
      polygon.setMap(null); // we render it ourselves via the controlled <Polygon>
      setDrawing(false);
    },
    [onChange],
  );

  if (keyLoading) return <Typography variant="caption" color="text.secondary">Loading map…</Typography>;

  if (!apiKey) {
    return (
      <Alert severity="info">
        Google Maps API key not configured yet. Add it under System Settings → Maps & Location API to enable
        geo-fence drawing.
      </Alert>
    );
  }

  if (!isLoaded) {
    return <Typography variant="caption" color="text.secondary">Loading map…</Typography>;
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
        Geo-Fence (optional — leave empty to show this ad everywhere)
      </Typography>
      <GoogleMap mapContainerStyle={MAP_STYLE} center={DEFAULT_CENTER} zoom={12}>
        {value && value.length >= 3 ? (
          <Polygon
            path={value}
            options={{ fillColor: '#FF8C00', fillOpacity: 0.2, strokeColor: '#FF8C00', strokeWeight: 2 }}
          />
        ) : null}
        <DrawingManager
          onLoad={() => setDrawing(true)}
          onPolygonComplete={onPolygonComplete}
          options={{
            drawingControl: !value || value.length < 3,
            drawingControlOptions: {
              drawingModes: [google.maps.drawing.OverlayType.POLYGON],
            },
            polygonOptions: {
              fillColor: '#FF8C00',
              fillOpacity: 0.2,
              strokeColor: '#FF8C00',
              strokeWeight: 2,
            },
          }}
        />
      </GoogleMap>
      <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {value && value.length >= 3 ? `${value.length}-point boundary drawn` : drawing ? 'Use the polygon tool to draw a boundary' : ''}
        </Typography>
        {value && value.length >= 3 ? (
          <Button size="small" onClick={() => onChange(null)}>
            Clear geo-fence
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
