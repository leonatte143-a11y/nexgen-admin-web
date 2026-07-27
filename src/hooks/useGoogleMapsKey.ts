import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';

/** Fetches the Google Maps API key from the backend at runtime (admin-stored, no rebuild needed).
 * Falls back to VITE_GOOGLE_MAPS_KEY for local dev if the backend key isn't configured yet. */
export function useGoogleMapsKey(): { apiKey: string | null; loading: boolean } {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .publicConfig()
      .then((cfg) => {
        if (cancelled) return;
        setApiKey(cfg.googleMapsApiKey || import.meta.env.VITE_GOOGLE_MAPS_KEY || null);
      })
      .catch(() => {
        if (!cancelled) setApiKey(import.meta.env.VITE_GOOGLE_MAPS_KEY || null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { apiKey, loading };
}
