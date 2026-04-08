import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { clearAuthSession, getAuthSession } from '@/features/auth/session';
import { refreshAccessToken } from '@/features/auth/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL이 설정되어 있지 않습니다.');
  }

  return API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
}

export function parseJsonMaybe(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function extractApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }

  if ('error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }

  return null;
}

export function assertOkStatus(
  response: { status: number; data: unknown },
  fallbackMessage: string
) {
  if (response.status < 200 || response.status >= 300) {
    const parsedBody = parseJsonMaybe(response.data);
    const message =
      extractApiErrorMessage(parsedBody) || `${fallbackMessage} (${response.status})`;
    throw new ApiError(message, response.status);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let _apiClient: ReturnType<typeof axios.create> | null = null;

export function getApiClient() {
  if (_apiClient) {
    return _apiClient;
  }

  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  });

  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const session = await getAuthSession();
    if (session?.accessToken) {
      const headers = AxiosHeaders.from(config.headers ?? {});
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
      }
      config.headers = headers;
    }

    return config;
  });

  client.interceptors.response.use(async (response) => {
    if (response.status !== 401) {
      return response;
    }

    const originalRequest = response.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (originalRequest._retry) {
      await clearAuthSession();
      router.replace('/login');
      return response;
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      const headers = AxiosHeaders.from(originalRequest.headers ?? {});
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      originalRequest.headers = headers;

      return await client.request(originalRequest);
    } catch {
      await clearAuthSession();
      router.replace('/login');
      return response;
    }
  });

  _apiClient = client;
  return client;
}
