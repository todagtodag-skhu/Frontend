import { apiClient } from '@/lib/apiClient';
import type { AuthResponse } from './types';

export async function socialLogin(provider: 'APPLE', token: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(`/api/auth/login/${provider}`, { token });
  return data;
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function withdraw(): Promise<void> {
  await apiClient.delete('/users/withdraw');
}

export async function signInWithApple(token: string): Promise<AuthResponse> {
  return socialLogin('APPLE', token);
}

export type { AuthResponse };
