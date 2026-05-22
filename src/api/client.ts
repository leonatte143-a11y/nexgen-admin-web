import axios, { type AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexgen_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
