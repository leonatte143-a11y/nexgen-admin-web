import type { HeatmapPreviewData } from '../types/dashboard';

export function mapHeatmapFromApi(api: unknown): HeatmapPreviewData {
  const empty: HeatmapPreviewData = {
    cities: [],
    hotspots: [],
    onlinePartners: 0,
    searchPointsCount: 0,
  };
  if (!api || typeof api !== 'object') return empty;

  const h = api as Record<string, unknown>;
  const partnerOnline = (h.partnerOnline as { id?: string; name?: string; city?: string }[]) ?? [];
  const searchPoints = (h.searchPoints as { label?: string; lat?: number; lng?: number }[]) ?? [];

  const cityCounts = new Map<string, number>();
  for (const p of partnerOnline) {
    const city = p.city || 'Rajahmundry';
    cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
  }

  const cities = [...cityCounts.entries()].map(([name, count]) => ({
    name,
    activeBookings: count,
    demandLevel: (count >= 5 ? 'high' : count >= 2 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
  }));

  const queryCounts = new Map<string, number>();
  for (const s of searchPoints) {
    const label = s.label || 'Service';
    queryCounts.set(label, (queryCounts.get(label) || 0) + 1);
  }
  const hotspots = [...queryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, intensity]) => ({
      area: 'Demand zone',
      label,
      intensity: Math.min(100, intensity * 20),
    }));

  return {
    cities,
    hotspots,
    onlinePartners: partnerOnline.length,
    searchPointsCount: searchPoints.length,
  };
}
