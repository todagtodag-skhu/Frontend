import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import { queryClient } from '@/lib/queryClient';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export const AUTH_SESSION_QUERY_KEY = ['auth', 'session'] as const;
const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const ROLE_KEY = 'auth.role';

function normalizeSession(session: AuthSession | null | undefined) {
  if (!session?.accessToken || !session.refreshToken || !session.role) {
    return null;
  }

  return session;
}

async function readPersistedSession(): Promise<AuthSession | null> {
  const [accessToken, refreshToken, role] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(ROLE_KEY),
  ]);

  return normalizeSession({
    accessToken: accessToken ?? '',
    refreshToken: refreshToken ?? '',
    role: role ?? '',
  });
}

export async function saveAuthSession(session: AuthSession) {
  const normalizedSession = normalizeSession(session);

  if (!normalizedSession) {
    queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
    return;
  }

  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, normalizedSession.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, normalizedSession.refreshToken),
    SecureStore.setItemAsync(ROLE_KEY, normalizedSession.role),
  ]);

  queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, normalizedSession);
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cachedSession = normalizeSession(
    queryClient.getQueryData<AuthSession | null>(AUTH_SESSION_QUERY_KEY)
  );

  if (cachedSession) {
    return cachedSession;
  }

  const persistedSession = await readPersistedSession();
  queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, persistedSession);
  return persistedSession;
}

export async function clearAuthSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(ROLE_KEY),
  ]);

  queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
}

export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: getAuthSession,
    initialData: null as AuthSession | null,
  });
}
