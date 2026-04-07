import { ChildProfile } from '@/components/todagi/types';
import { MOCK_CHILDREN } from '@/mocks/data';
import { getAuthSession, saveAuthSession } from '@/features/auth/session';

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

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL이 설정되어 있지 않습니다.');
  }

  return API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
}

async function getFirstRelationId(accessToken: string): Promise<string | null> {
  const response = await fetch(`${getApiBaseUrl()}/relation/todak`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RelationListResponse;
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
    const response = await fetch(`${getApiBaseUrl()}/relation/todak`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('아이 목록을 불러오지 못했습니다:', response.status);
      return structuredClone(MOCK_CHILDREN);
    }

    const data = await response.json();
    
    // API 응답 형식을 ChildProfile[]로 변환
    if (data.relations && Array.isArray(data.relations)) {
      return data.relations.map((rel: any) => ({
        id: rel.relationId?.toString() || `relation-${rel.relationId}`,
        name: rel.sungjangName || '성장이',
        birthday: '-',
        inviteCode: '',
      }));
    }

    return structuredClone(MOCK_CHILDREN);
  } catch (error) {
    console.error('아이 목록 조회 중 오류가 발생했습니다:', error);
    return structuredClone(MOCK_CHILDREN);
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
    const response = await fetch(`${getApiBaseUrl()}/relation/connect/todak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        code: input.inviteCode,
      }),
    });

    let relationId: string | null = null;
    let accessTokenForUpdate = session.accessToken;

    if (response.ok) {
      const data = (await response.json()) as RelationConnectResponse;

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
      throw new Error(`아이 생성에 실패했습니다: ${response.status}`);
    }

    if (!relationId) {
      throw new Error('관계 ID를 찾을 수 없습니다.');
    }

    // 성장이 정보 업데이트
    const normalizedBirthday = normalizeBirthday(input.birthday);
    const updateResponse = await fetch(`${getApiBaseUrl()}/relation/${relationId}/sungjang-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessTokenForUpdate}`,
      },
      body: JSON.stringify({
        sungjangName: input.name,
        sungjangBirthday: normalizedBirthday,
      }),
    });

    if (!updateResponse.ok) {
      console.error('성장이 정보 업데이트에 실패했습니다:', updateResponse.status);
    }

    return {
      id: relationId,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  } catch (error) {
    console.error('아이 생성 중 오류가 발생했습니다:', error);
    
    // 폴백: 로컬 생성
    return {
      id: `child-${Date.now()}`,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  }
}

export async function updateChild(
  childId: string,
  input: CreateChildInput
): Promise<ChildProfile> {
  const session = await getAuthSession();
  
  if (!session) {
    return {
      id: childId,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/relation/${childId}/sungjang-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        sungjangName: input.name,
        sungjangBirthday: normalizeBirthday(input.birthday),
      }),
    });

    if (!response.ok) {
      throw new Error(`아이 정보 업데이트에 실패했습니다: ${response.status}`);
    }

    return {
      id: childId,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  } catch (error) {
    console.error('아이 정보 업데이트 중 오류가 발생했습니다:', error);
    
    return {
      id: childId,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  }
}

export async function deleteChild(childId: string): Promise<void> {
  const session = await getAuthSession();
  
  if (!session) {
    return;
  }

  console.warn('아이 삭제 API가 없습니다. 로컬에서만 삭제됩니다.');
}
