import { useCallback, useEffect, useRef, useState } from 'react';
import { isRequestCancelled } from '../api/client';

/**
 * Fetch once per mount with stale-response guard (StrictMode-safe).
 * Pairs with apiGet in-flight dedupe to avoid duplicate network calls.
 */
export function useMountedFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generationRef = useRef(0);

  const run = useCallback(async () => {
    const generation = ++generationRef.current;
    setLoading(true);
    try {
      const result = await fetcher();
      if (generation !== generationRef.current) return;
      setData(result);
      setError(null);
    } catch (e) {
      if (generation !== generationRef.current) return;
      if (isRequestCancelled(e)) return;
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      if (generation === generationRef.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    generationRef.current += 1;
    run();
    return () => {
      generationRef.current += 1;
    };
  }, [run]);

  return { data, loading, error, reload: run, setData };
}
