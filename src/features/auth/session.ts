import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  role: string;
}

interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const ROLE_KEY = 'auth.role';

const memoryStorage = new Map<string, string>();

function createMemoryAdapter(): StorageAdapter {
  return {
    async getItem(key) {
      return memoryStorage.get(key) ?? null;
    },
    async setItem(key, value) {
      memoryStorage.set(key, value);
    },
    async deleteItem(key) {
      memoryStorage.delete(key);
    },
  };
}

function createSecureStoreAdapter(): StorageAdapter {
  return {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
    deleteItem: (key) => SecureStore.deleteItemAsync(key),
  };
}

function createWebAdapter(): StorageAdapter {
  return {
    async getItem(key) {
      return window.localStorage.getItem(key);
    },
    async setItem(key, value) {
      window.localStorage.setItem(key, value);
    },
    async deleteItem(key) {
      window.localStorage.removeItem(key);
    },
  };
}

let _adapter: StorageAdapter | null = null;

function getAdapter(): StorageAdapter {
  if (_adapter) return _adapter;

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    _adapter = createWebAdapter();
  } else if (Platform.OS !== 'web') {
    _adapter = createSecureStoreAdapter();
  } else {
    _adapter = createMemoryAdapter();
  }

  return _adapter;
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  const adapter = getAdapter();
  await Promise.all([
    adapter.setItem(ACCESS_TOKEN_KEY, session.accessToken),
    adapter.setItem(REFRESH_TOKEN_KEY, session.refreshToken),
    adapter.setItem(ROLE_KEY, session.role),
  ]);
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const adapter = getAdapter();
  const [accessToken, refreshToken, role] = await Promise.all([
    adapter.getItem(ACCESS_TOKEN_KEY),
    adapter.getItem(REFRESH_TOKEN_KEY),
    adapter.getItem(ROLE_KEY),
  ]);

  if (!accessToken || !refreshToken || !role) return null;

  return { accessToken, refreshToken, role };
}

export async function updateTokens(accessToken: string, refreshToken: string): Promise<void> {
  const adapter = getAdapter();
  await Promise.all([
    adapter.setItem(ACCESS_TOKEN_KEY, accessToken),
    adapter.setItem(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearAuthSession(): Promise<void> {
  const adapter = getAdapter();
  await Promise.all([
    adapter.deleteItem(ACCESS_TOKEN_KEY),
    adapter.deleteItem(REFRESH_TOKEN_KEY),
    adapter.deleteItem(ROLE_KEY),
  ]);
}
