import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInviteCode,
  connectTodak,
  getTodakRelations,
  updateSungjangInfo,
  UpdateSungjangInfoRequest,
} from './api';
import { saveAuthSession } from '@/features/auth/session';

export const RELATION_KEYS = {
  all: ['relation'] as const,
  todakList: () => [...RELATION_KEYS.all, 'todak'] as const,
};

/** 기존 성장이 유저가 추가 초대코드 생성 */
export function useCreateInviteCode() {
  return useMutation({
    mutationFn: createInviteCode,
  });
}

/** 토닥이 유저가 초대코드 입력으로 성장이와 연결 */
export function useConnectTodak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => connectTodak(code),
    onSuccess: async (data) => {
      await saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
      });
      queryClient.invalidateQueries({ queryKey: RELATION_KEYS.todakList() });
    },
  });
}

/** 토닥이 유저의 관계 목록 조회 */
export function useTodakRelations() {
  return useQuery({
    queryKey: RELATION_KEYS.todakList(),
    queryFn: getTodakRelations,
  });
}

/** 성장이 정보(이름, 생일) 수정 - relationId를 mutate 시점에 전달 */
export function useUpdateSungjangInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      relationId,
      ...body
    }: { relationId: number } & UpdateSungjangInfoRequest) => updateSungjangInfo(relationId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELATION_KEYS.todakList() });
    },
  });
}
