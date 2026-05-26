import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * VITE_API_BASE_URL = API origin only (e.g. https://example.com or http://localhost:4000).
 * /api/v1 is always appended here so endpoint paths stay relative (/auth/..., /admin/...).
 */
function resolveApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').trim();
  const origin = raw.replace(/\/+$/, '').replace(/\/api\/v\d+$/i, '');
  return `${origin}/api/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl();

if (import.meta.env.PROD && /localhost|127\.0\.0\.1/i.test(API_BASE_URL)) {
  console.error(
    '[NEXGEN Admin] VITE_API_BASE_URL must point to your deployed API origin before production build.',
  );
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

function buildFinalUrl(config: InternalAxiosRequestConfig): string {
  const base = String(config.baseURL || apiClient.defaults.baseURL || '').replace(/\/+$/, '');
  const path = config.url || '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexgen_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // temporary dev log
  // eslint-disable-next-line no-console
  console.log('API URL:', buildFinalUrl(config));

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexgen_admin_token');
      localStorage.removeItem('nexgen_admin_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const msg =
      error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(msg));
  },
);

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<{ success: boolean; data: T }>(path, { params });
  return data.data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.post<{ success: boolean; data: T }>(path, body);
  return data.data;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.put<{ success: boolean; data: T }>(path, body);
  return data.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const { data } = await apiClient.delete<{ success: boolean; data: T }>(path);
  return data.data;
}
