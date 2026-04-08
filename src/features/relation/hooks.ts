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

export const RELATION_QUERY_KEYS = {
  all: ['relations'] as const,
  list: () => [...RELATION_QUERY_KEYS.all, 'list'] as const,
} as const;
export function useRelations() {
  return useQuery<RelationListResponse, Error>({
    queryKey: RELATION_QUERY_KEYS.list(),
    queryFn: getRelations,
  });
}
export function useCreateRelationInviteCode() {
  return useMutation<InviteCodeResponse, Error, void>({
    mutationFn: () => createRelationInviteCode(),
  });
}
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

interface UpdateSungjangInfoInput extends UpdateSungjangInfoRequest {
  relationId: number | string;
}
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
