import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRelations,
  createRelationInviteCode,
  connectTodak,
  updateSungjangInfo,
  type RelationListResponse,
  type InviteCodeResponse,
  type ConnectTodakResponse,
  type UpdateSungjangInfoRequest,
} from '@/features/relation/api';
import { AUTH_SESSION_QUERY_KEY } from '@/features/auth/session';

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const RELATION_QUERY_KEYS = {
  all: ['relations'] as const,
  list: () => [...RELATION_QUERY_KEYS.all, 'list'] as const,
} as const;

// ─── GET /relation/todak ───────────────────────────────────────────────────────

/**
 * 토닥이 유저가 소속된 관계 목록 조회
 *
 * 에러 케이스:
 * - 403: 토닥이 계정이 아닌 경우
 * - 404: 유저를 찾을 수 없는 경우
 */
export function useRelations() {
  return useQuery<RelationListResponse, Error>({
    queryKey: RELATION_QUERY_KEYS.list(),
    queryFn: getRelations,
  });
}

// ─── POST /relation/invite-code ────────────────────────────────────────────────

/**
 * 기존 연결이 있는 성장이 유저의 초대코드 생성 (5분 유효)
 *
 * 에러 케이스:
 * - 401: 인증 필요
 * - 403: PENDING 유저 접근 (온보딩 API 사용해야 함)
 * - 404: 연결된 관계 없음
 */
export function useCreateRelationInviteCode() {
  return useMutation<InviteCodeResponse, Error, void>({
    mutationFn: () => createRelationInviteCode(),
  });
}

// ─── POST /relation/connect/todak ─────────────────────────────────────────────

/**
 * 기존 연결이 있는 토닥이가 초대코드로 성장이를 추가 연결
 * 성공 시 새 토큰으로 세션을 갱신하고 관계 목록을 무효화합니다.
 *
 * 에러 케이스:
 * - 400: 유효하지 않은 초대코드
 * - 403: 토닥이 계정이 아닌 경우
 * - 404: 유저 없음
 * - 409: 이미 연결된 관계
 */
export function useConnectTodak() {
  const queryClient = useQueryClient();

  return useMutation<ConnectTodakResponse, Error, string>({
    mutationFn: (code: string) => connectTodak(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RELATION_QUERY_KEYS.all });
    },
  });
}

// ─── POST /relation/{relationId}/sungjang-info ────────────────────────────────

interface UpdateSungjangInfoInput extends UpdateSungjangInfoRequest {
  relationId: number | string;
}

/**
 * 성장이 이름 및 생일 수정 (토닥이 계정 필요)
 * 성공 시 관계 목록을 무효화합니다.
 *
 * 에러 케이스:
 * - 400: 잘못된 요청 데이터
 * - 401: 인증 필요
 * - 403: 토닥이 계정이 아닌 경우
 * - 404: 관계 없음
 */
export function useUpdateSungjangInfo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateSungjangInfoInput>({
    mutationFn: ({ relationId, sungjangName, sungjangBirthday }) =>
      updateSungjangInfo(relationId, { sungjangName, sungjangBirthday }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELATION_QUERY_KEYS.all });
    },
  });
}
