import { Platform } from 'react-native';
import type { AsyncStorageStatic } from '@react-native-async-storage/async-storage';

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

let storageAdapterPromise: Promise<StorageAdapter> | null = null;

function createMemoryStorageAdapter(): StorageAdapter {
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

async function createStorageAdapter(): Promise<StorageAdapter> {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
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

  const asyncStorageModule = await import('@react-native-async-storage/async-storage');
  const AsyncStorage = (asyncStorageModule.default ?? asyncStorageModule) as AsyncStorageStatic;

  if (
    !AsyncStorage ||
    typeof AsyncStorage.getItem !== 'function' ||
    typeof AsyncStorage.setItem !== 'function' ||
    typeof AsyncStorage.removeItem !== 'function'
  ) {
    console.warn('AsyncStorage 모듈을 불러오지 못했습니다. 메모리 저장소로 대체합니다.');
    return createMemoryStorageAdapter();
  }

  return {
    async getItem(key) {
      return AsyncStorage.getItem(key);
    },
    async setItem(key, value) {
      await AsyncStorage.setItem(key, value);
    },
    async deleteItem(key) {
      await AsyncStorage.removeItem(key);
    },
  };
}

async function getStorageAdapter() {
  if (!storageAdapterPromise) {
    storageAdapterPromise = createStorageAdapter();
  }

  return storageAdapterPromise;
}

export async function saveAuthSession(session: AuthSession) {
  const storage = await getStorageAdapter();

  await Promise.all([
    storage.setItem(ACCESS_TOKEN_KEY, session.accessToken),
    storage.setItem(REFRESH_TOKEN_KEY, session.refreshToken),
    storage.setItem(ROLE_KEY, session.role),
  ]);
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const storage = await getStorageAdapter();
  const [accessToken, refreshToken, role] = await Promise.all([
    storage.getItem(ACCESS_TOKEN_KEY),
    storage.getItem(REFRESH_TOKEN_KEY),
    storage.getItem(ROLE_KEY),
  ]);

  if (!accessToken || !refreshToken || !role) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    role,
  };
}

export async function clearAuthSession() {
  const storage = await getStorageAdapter();

  await Promise.all([
    storage.deleteItem(ACCESS_TOKEN_KEY),
    storage.deleteItem(REFRESH_TOKEN_KEY),
    storage.deleteItem(ROLE_KEY),
  ]);
}
