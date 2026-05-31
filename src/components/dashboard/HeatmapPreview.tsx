import { Box, Card, CardContent, Chip, LinearProgress, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import type { HeatmapPreviewData } from '../../types/dashboard';

const demandColor = { high: 'error', medium: 'warning', low: 'default' } as const;

interface HeatmapPreviewProps {
  data: HeatmapPreviewData;
}

export function HeatmapPreview({ data }: HeatmapPreviewProps) {
  return (
    <Card sx={{ height: '100%', background: 'linear-gradient(180deg, #FFF 0%, #F0F7FF 100%)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <MapIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Live Service Demand
          </Typography>
          <Chip label="Map preview" size="small" variant="outlined" />
        </Box>

        <Box
          sx={{
            height: 140,
            borderRadius: 2,
            border: '2px dashed #90CAF9',
            bgcolor: 'rgba(25, 118, 210, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', px: 2 }}>
            Google Maps / Mapbox integration placeholder
            <br />
            {data.searchPointsCount} search points · {data.onlinePartners} partners online
          </Typography>
          {data.hotspots.slice(0, 3).map((h, i) => (
            <Box
              key={h.area}
              sx={{
                position: 'absolute',
                width: 12 + i * 4,
                height: 12 + i * 4,
                borderRadius: '50%',
                bgcolor: `rgba(255, 140, 0, ${0.3 + h.intensity / 200})`,
                top: `${20 + i * 25}%`,
                left: `${15 + i * 28}%`,
              }}
            />
          ))}
        </Box>

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          City activity
        </Typography>
        {data.cities.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No live demand data yet — search logs and online partners will populate this map.
          </Typography>
        )}
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {data.cities.map((c) => (
            <Box key={c.name}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                <Typography variant="body2">{c.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="caption">{c.activeBookings} active</Typography>
                  <Chip label={c.demandLevel} size="small" color={demandColor[c.demandLevel]} />
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, c.activeBookings * 8)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          ))}
        </Box>

        <Typography variant="caption" sx={{ fontWeight: 700, mt: 2, display: 'block', textTransform: 'uppercase' }}>
          Hotspot areas
        </Typography>
        {data.hotspots.map((h) => (
          <Typography key={h.area} variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {h.area} — {h.label}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
}
