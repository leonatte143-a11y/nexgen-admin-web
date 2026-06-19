import { useCallback, useRef, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { adminApi } from '../api/adminApi';

type HoverKind = 'partner' | 'user' | 'staff';

type Meta = {
  createdAt?: string;
  totalJobs?: number;
  rating?: number;
  phone?: string;
  name?: string;
};

export function useHoverMeta(kind: HoverKind) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const cache = useRef(new Map<string, Meta>());

  const fetchMeta = useCallback(async (id: string) => {
    if (cache.current.has(id)) return cache.current.get(id)!;
    const data = (await adminApi.hoverMeta(kind, id)) as Meta;
    cache.current.set(id, data);
    return data;
  }, [kind]);

  const onEnter = async (e: React.MouseEvent, id: string) => {
    setPos({ x: e.clientX + 12, y: e.clientY + 12 });
    setVisible(true);
    try {
      const m = await fetchMeta(id);
      setMeta(m);
    } catch {
      setMeta(null);
    }
  };

  const onLeave = () => {
    setVisible(false);
    setMeta(null);
  };

  const tooltip = visible && meta ? (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 1000,
        p: 1.5,
        minWidth: 200,
        pointerEvents: 'none',
        bgcolor: '#fff',
        border: '1px solid #ff9800',
      }}
    >
      {meta.name ? <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{meta.name}</Typography> : null}
      <Typography variant="body2">Phone: {meta.phone || '—'}</Typography>
      <Typography variant="body2">Created: {meta.createdAt ? new Date(meta.createdAt).toLocaleDateString() : '—'}</Typography>
      <Typography variant="body2">Total jobs: {meta.totalJobs ?? '—'}</Typography>
      <Typography variant="body2">Rating: {meta.rating ?? '—'}</Typography>
    </Paper>
  ) : null;

  return { onEnter, onLeave, tooltip };
}

export function HoverTableRow({
  id,
  kind,
  children,
}: {
  id: string;
  kind: HoverKind;
  children: React.ReactNode;
}) {
  const { onEnter, onLeave, tooltip } = useHoverMeta(kind);
  return (
    <>
      <Box
        component="tr"
        onMouseEnter={(e) => onEnter(e as unknown as React.MouseEvent, id)}
        onMouseLeave={onLeave}
        sx={{ display: 'table-row' }}
      >
        {children}
      </Box>
      {tooltip}
    </>
  );
}
