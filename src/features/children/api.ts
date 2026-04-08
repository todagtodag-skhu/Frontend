import { ChildProfile } from '@/components/todagi/types';
import { MOCK_CHILDREN } from '@/mocks/data';
import { getAuthSession } from '@/features/auth/session';
import { getRelations, connectTodak, updateSungjangInfo } from '@/features/relation/api';

export type CreateChildInput = {
  inviteCode: string;
  name: string;
  birthday: string;
};

function normalizeBirthday(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(trimmed)) return trimmed.replace(/\./g, '-');
  return trimmed;
}

export async function getChildren(): Promise<ChildProfile[]> {
  const session = await getAuthSession();
  if (!session) {
    return structuredClone(MOCK_CHILDREN);
  }

  try {
    const data = await getRelations();
    return data.relations.map((rel) => ({
      id: rel.relationId.toString(),
      name: rel.sungjangName || '성장이',
      birthday: '-',
      inviteCode: '',
    }));
  } catch (error) {
    console.error('아이 목록 조회 중 오류가 발생했습니다:', error);
    throw error;
  }
}

export async function createChild(input: CreateChildInput): Promise<ChildProfile> {
  const session = await getAuthSession();

  if (!session) {
    return {
      id: `child-${Date.now()}`,
      inviteCode: input.inviteCode,
      name: input.name,
      birthday: input.birthday,
    };
  }

  try {
    let relationId: string;

    try {
      const data = await connectTodak(input.inviteCode);
      relationId = data.relationId.toString();
    } catch (connectError: unknown) {
      // 이미 연결된 관계(409)이거나 유효하지 않은 코드(400)인 경우 기존 관계 첫 번째 항목 사용
      const status =
        connectError instanceof Error && 'statusCode' in connectError
          ? (connectError as { statusCode: number }).statusCode
          : 0;

      if (status === 409 || status === 400) {
        const relations = await getRelations();
        const first = relations.relations[0];
        if (!first?.relationId) {
          throw new Error('관계 ID를 찾을 수 없습니다.');
        }
        relationId = first.relationId.toString();
      } else {
        throw connectError;
      }
    }

    await updateSungjangInfo(relationId, {
      sungjangName: input.name,
      sungjangBirthday: normalizeBirthday(input.birthday),
    });

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
    await updateSungjangInfo(relationId, {
      sungjangName: input.name,
      sungjangBirthday: normalizeBirthday(input.birthday),
    });

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

export async function deleteChild(_childId: string): Promise<void> {
  console.warn('아이 삭제 API가 없습니다. 로컬에서만 삭제됩니다.');
}
