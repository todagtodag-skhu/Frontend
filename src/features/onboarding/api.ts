import { apiClient } from '@/lib/apiClient';
import type { AuthResponse } from '@/features/auth/types';

/** PENDING 토큰으로 호출. inviteCode로 역할을 TODAK으로 변경하고 관계를 연결합니다. */
export async function todakOnboarding(inviteCode: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/users/onboarding/todak', { inviteCode });
  return data;
}

/** PENDING 토큰으로 호출. 토닥이와 최초 연결하기 위한 초대코드를 생성합니다. */
export async function createSungjangInviteCode(): Promise<{ inviteCode: string }> {
  const { data } = await apiClient.post<{ inviteCode: string }>(
    '/users/onboarding/sungjang/invite-code',
  );
  return data;
}
