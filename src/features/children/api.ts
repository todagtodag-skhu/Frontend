import { ChildProfile } from '@/components/todagi/types';
import { MOCK_CHILDREN } from '@/mocks/data';

// 실제 API 연동 시 fetch 호출로 교체

export type CreateChildInput = {
  inviteCode: string;
  name: string;
  birthday: string;
};

export async function getChildren(): Promise<ChildProfile[]> {
  return structuredClone(MOCK_CHILDREN);
}

export async function createChild(input: CreateChildInput): Promise<ChildProfile> {
  return {
    id: `child-${Date.now()}`,
    inviteCode: input.inviteCode,
    name: input.name,
    birthday: input.birthday,
  };
}

export async function updateChild(
  childId: string,
  input: CreateChildInput
): Promise<ChildProfile> {
  return {
    id: childId,
    inviteCode: input.inviteCode,
    name: input.name,
    birthday: input.birthday,
  };
}

export async function deleteChild(_childId: string): Promise<void> {
  // no-op in mock
}
