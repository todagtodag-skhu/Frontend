import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { ChildProfile } from '@/components/todagi/types';
import { MOCK_CHILDREN } from '@/mocks/data';
import { refreshAccessToken } from '@/features/auth/api';
import { clearAuthSession, getAuthSession, saveAuthSession } from '@/features/auth/session';

// 실제 API 연동

export type CreateChildInput = {
  inviteCode: string;
  name: string;
  birthday: string;
};

type RelationConnectResponse = {
  relationId: number | string;
  accessToken?: string;
  refreshToken?: string;
  role?: string;
};

type RelationListResponse = {
  relations?: Array<{
    relationId?: number | string;
    sungjangName?: string | null;
  }>;
};

function normalizeBirthday(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}\.\d{2}\.\d{2}$/.test(trimmed)) {
    return trimmed.replace(/\./g, '-');
  }

  return trimmed;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

function parseJsonMaybe(value: unknown) {
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

function extractApiErrorMessage(payload: unknown): string | null {
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

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL이 설정되어 있지 않습니다.');
  }

  return API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
}

let apiClient: ReturnType<typeof axios.create> | null = null;

function getApiClient() {
  if (apiClient) {
    return apiClient;
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

    const originalRequest = response.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (originalRequest._retry) {
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

  apiClient = client;
  return client;
}

function assertOkStatus(response: { status: number; data: unknown }, fallbackMessage: string) {
  if (response.status < 200 || response.status >= 300) {
    const parsedBody = parseJsonMaybe(response.data);
    const message =
      extractApiErrorMessage(parsedBody) || `${fallbackMessage} (${response.status})`;
    throw new Error(message);
  }
}

async function getFirstRelationId(accessToken: string): Promise<string | null> {
  const response = await getApiClient().get('/relation/todak', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status < 200 || response.status >= 300) {
    return null;
  }

  const data = parseJsonMaybe(response.data) as RelationListResponse | null;
  const first = data?.relations?.[0];

  if (!first?.relationId) {
    return null;
  }

  return first.relationId.toString();
}

export async function getChildren(): Promise<ChildProfile[]> {
  const session = await getAuthSession();
  if (!session) {
    return structuredClone(MOCK_CHILDREN);
  }

  try {
    const response = await getApiClient().get('/relation/todak');
    assertOkStatus(response, '아이 목록을 불러오지 못했습니다.');

    const data = parseJsonMaybe(response.data) as RelationListResponse | null;
    
    // API 응답 형식을 ChildProfile[]로 변환
    if (data?.relations && Array.isArray(data.relations)) {
      return data.relations.map((rel: any) => ({
        id: rel.relationId?.toString() || `relation-${rel.relationId}`,
        name: rel.sungjangName || '성장이',
        birthday: '-',
        inviteCode: '',
      }));
    }

    throw new Error('아이 목록 응답이 올바르지 않습니다.');
  } catch (error) {
    console.error('아이 목록 조회 중 오류가 발생했습니다:', error);
    throw error;
  }
}

export async function createChild(input: CreateChildInput): Promise<ChildProfile> {
  const session = await getAuthSession();
  
  if (!session) {
    // 로컬 생성 (테스트용)
    return {
      id: `child-${Date.now()}`,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  }

  try {
    // 토닥이 관계 연결
    const response = await getApiClient().post(
      '/relation/connect/todak',
      {
        code: input.inviteCode,
      },
    );

    let relationId: string | null = null;
    let accessTokenForUpdate = session.accessToken;

    if (response.status >= 200 && response.status < 300) {
      const data = parseJsonMaybe(response.data) as RelationConnectResponse | null;

      if (data?.accessToken && data?.refreshToken && data?.role) {
        await saveAuthSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.role,
        });
        accessTokenForUpdate = data.accessToken;
      }

      if (!data?.relationId) {
        throw new Error('관계 ID를 찾을 수 없습니다.');
      }

      relationId = data.relationId.toString();
    } else if (response.status === 400 || response.status === 409) {
      // 초대코드가 이미 사용됐거나 관계가 존재하는 경우: 기존 관계 조회
      relationId = await getFirstRelationId(session.accessToken);
    } else {
      const parsedBody = parseJsonMaybe(response.data);
      const message =
        extractApiErrorMessage(parsedBody) || `아이 생성에 실패했습니다: ${response.status}`;
      throw new Error(message);
    }

    if (!relationId) {
      throw new Error('관계 ID를 찾을 수 없습니다.');
    }

    // 성장이 정보 업데이트
    const normalizedBirthday = normalizeBirthday(input.birthday);
    const updateResponse = await getApiClient().post(
      `/relation/${relationId}/sungjang-info`,
      {
        sungjangName: input.name,
        sungjangBirthday: normalizedBirthday,
      },
      {
        headers: {
          Authorization: `Bearer ${accessTokenForUpdate}`,
        },
      }
    );

    assertOkStatus(updateResponse, '성장이 정보 업데이트에 실패했습니다.');

    return {
      id: relationId,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  } catch (error) {
    console.error('아이 생성 중 오류가 발생했습니다:', error);
    throw error;
  }
}

export async function updateChild(
  relationId: string,
  input: CreateChildInput
): Promise<ChildProfile> {
  const session = await getAuthSession();
  
  if (!session) {
    return {
      id: relationId,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  }

  try {
    const response = await getApiClient().post(
      `/relation/${relationId}/sungjang-info`,
      {
        sungjangName: input.name,
        sungjangBirthday: normalizeBirthday(input.birthday),
      }
    );

    assertOkStatus(response, '아이 정보 업데이트에 실패했습니다.');

    return {
      id: relationId,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  } catch (error) {
    console.error('아이 정보 업데이트 중 오류가 발생했습니다:', error);
    throw error;
  }
}

export async function deleteChild(childId: string): Promise<void> {
  const session = await getAuthSession();
  
  if (!session) {
    return;
  }

  console.warn('아이 삭제 API가 없습니다. 로컬에서만 삭제됩니다.');
}
