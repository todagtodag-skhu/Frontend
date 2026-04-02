import { Platform } from 'react-native';

export interface AuthSession {
  accessToken: string;
  role: string;
}

interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

const ACCESS_TOKEN_KEY = 'auth.accessToken';
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

  return createMemoryStorageAdapter();
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
    storage.setItem(ROLE_KEY, session.role),
  ]);
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const storage = await getStorageAdapter();
  const [accessToken, role] = await Promise.all([
    storage.getItem(ACCESS_TOKEN_KEY),
    storage.getItem(ROLE_KEY),
  ]);

  if (!accessToken || !role) {
    return null;
  }

  return {
    accessToken,
    role,
  };
}

export async function clearAuthSession() {
  const storage = await getStorageAdapter();

  await Promise.all([
    storage.deleteItem(ACCESS_TOKEN_KEY),
    storage.deleteItem(ROLE_KEY),
  ]);
}
