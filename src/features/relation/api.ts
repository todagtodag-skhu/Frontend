import { apiClient } from '@/lib/apiClient';
import type { UserRole } from '@/features/auth/types';

export interface RelationConnectResponse {
  relationId: number;
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

export interface RelationItem {
  relationId: number;
  sungjangName: string;
}

export interface RelationListResponse {
  relations: RelationItem[];
}

export interface UpdateSungjangInfoRequest {
  sungjangName: string;
  sungjangBirthday: string; // ISO date string e.g. "2024-01-01"
}

/** 기존 연결이 존재하는 성장이가 초대코드 생성 (SUNGJANG 토큰) */
export async function createInviteCode(): Promise<{ inviteCode: string }> {
  const { data } = await apiClient.post<{ inviteCode: string }>('/relation/invite-code');
  return data;
}

/** 토닥이 유저가 초대코드 입력으로 성장이와 추가 연결 (TODAK 토큰) */
export async function connectTodak(code: string): Promise<RelationConnectResponse> {
  const { data } = await apiClient.post<RelationConnectResponse>('/relation/connect/todak', {
    code,
  });
  return data;
}

/** 토닥이 유저의 관계 목록 조회 (TODAK 토큰) */
export async function getTodakRelations(): Promise<RelationListResponse> {
  const { data } = await apiClient.get<RelationListResponse>('/relation/todak');
  return data;
}

/** 성장이 정보(이름, 생일) 수정 (TODAK 토큰) */
export async function updateSungjangInfo(
  relationId: number,
  body: UpdateSungjangInfoRequest,
): Promise<void> {
  await apiClient.post(`/relation/${relationId}/sungjang-info`, body);
}
