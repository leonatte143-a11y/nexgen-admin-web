import { Box, Typography } from '@mui/material';
import type { AdPlacement } from '../utils/adAssetValidation';

type Props = {
  placement: AdPlacement;
  previewUrl: string | null;
  mediaType: 'image' | 'video';
};

const PLACEMENT_FRAMES: Record<
  AdPlacement,
  { title: string; aspectRatio: string; maxWidth: number }
> = {
  home_dashboard: {
    title: 'User Home Dashboard',
    aspectRatio: '1080 / 608',
    maxWidth: 420,
  },
  partner_live_tracking: {
    title: 'Partner Live Map Strip',
    aspectRatio: '320 / 50',
    maxWidth: 360,
  },
};

export function PlacementPreviewContainer({ placement, previewUrl, mediaType }: Props) {
  const frame = PLACEMENT_FRAMES[placement];

  return (
    <Box sx={{ p: 2, border: '2px dashed', borderColor: '#ff9800', borderRadius: 2, bgcolor: '#fffaf5' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        Placement preview — {frame.title}
      </Typography>
      <Box
        sx={{
          mt: 1,
          width: '100%',
          maxWidth: frame.maxWidth,
          mx: 'auto',
          aspectRatio: frame.aspectRatio,
          bgcolor: '#1a1a1a',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #ddd',
        }}
      >
        {previewUrl && mediaType === 'image' ? (
          <Box component="img" src={previewUrl} alt="Campaign preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : previewUrl && mediaType === 'video' ? (
          <Box component="video" src={previewUrl} muted autoPlay loop playsInline sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', px: 2, textAlign: 'center' }}>
            Upload a valid asset to preview how it will appear in the app
          </Typography>
        )}
      </Box>
    </Box>
  );
}
