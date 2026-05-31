import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

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
  // Treat 204 as success; we normalize empty bodies in unwrapApiResponse
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
});

const inflightGets = new Map<string, Promise<unknown>>();

function getInflightKey(path: string, params?: Record<string, unknown>) {
  return `GET:${path}:${JSON.stringify(params ?? {})}`;
}

function buildFinalUrl(config: InternalAxiosRequestConfig): string {
  const base = String(config.baseURL || apiClient.defaults.baseURL || '').replace(/\/+$/, '');
  const path = config.url || '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexgen_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('API URL:', buildFinalUrl(config));
  }

  return config;
});

export function isRequestCancelled(error: unknown): boolean {
  if (axios.isCancel(error)) return true;
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code?: string }).code === 'ERR_CANCELED';
  }
  return error instanceof Error && error.name === 'CanceledError';
}

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    if (isRequestCancelled(error)) {
      return Promise.reject(error);
    }
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

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

/**
 * Normalize API body — 204 / empty must not throw or wipe valid list data.
 */
export function unwrapApiResponse<T>(response: AxiosResponse): T {
  const { status, data } = response;

  if (status === 204 || data === '' || data == null) {
    return [] as T;
  }

  if (typeof data === 'object' && data !== null && 'success' in data) {
    const envelope = data as ApiEnvelope<T>;
    if (envelope.success === false) {
      throw new Error(envelope.message || 'Request failed');
    }
    return envelope.data;
  }

  throw new Error('Invalid API response format');
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const key = getInflightKey(path, params);
  const existing = inflightGets.get(key);
  if (existing) return existing as Promise<T>;

  const promise = (async () => {
    try {
      const response = await apiClient.get(path, { params });
      return unwrapApiResponse<T>(response);
    } finally {
      inflightGets.delete(key);
    }
  })();

  inflightGets.set(key, promise);
  return promise;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.post(path, body);
  return unwrapApiResponse<T>(response);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.put(path, body);
  return unwrapApiResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await apiClient.delete(path);
  return unwrapApiResponse<T>(response);
}
