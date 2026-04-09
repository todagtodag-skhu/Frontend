import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuthSession, updateTokens, clearAuthSession } from '@/features/auth/session';
import type { AuthResponse } from '@/features/auth/types';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// --- Token refresh queue ---
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// Request: attach Bearer token
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getAuthSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Response: on 401 attempt silent token refresh, then retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    isRefreshing = true;

    try {
      const session = await getAuthSession();
      if (!session?.refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post<AuthResponse>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken: session.refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      await updateTokens(data.accessToken, data.refreshToken);
      processQueue(data.accessToken);

      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch {
      processQueue('');
      await clearAuthSession();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
