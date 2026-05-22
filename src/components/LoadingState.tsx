import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
      <CircularProgress color="primary" />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {label}
      </Typography>
    </Box>
  );
}
