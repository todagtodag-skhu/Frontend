import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAuthSession } from '@/features/auth/session';
import {
  signInWithApple,
  logout,
  withdraw,
  refreshAccessToken,
  requestSungjangInviteCode,
  connectWithInviteCode,
  type AuthTokenData,
  type InviteCodeResponse,
} from '@/features/auth/api';
import { AUTH_SESSION_QUERY_KEY } from '@/features/auth/session';
export function useSignInWithApple() {
  const queryClient = useQueryClient();

  return useMutation<AuthTokenData, Error, string>({
    mutationFn: (token: string) => signInWithApple(token),
    onSuccess: async (data) => {
      await saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
      });
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
    },
  });
}
export function useRefreshToken() {
  return useMutation<string, Error, void>({
    mutationFn: () => refreshAccessToken(),
  });
}
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => logout(),
    onSettled: () => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
      queryClient.clear();
    },
  });
}
export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => withdraw(),
    onSettled: () => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
      queryClient.clear();
    },
  });
}
export function useRequestSungjangInviteCode() {
  return useMutation<InviteCodeResponse, Error, string>({
    mutationFn: (accessToken: string) => requestSungjangInviteCode(accessToken),
  });
}

interface ConnectWithInviteCodeInput {
  accessToken: string;
  inviteCode: string;
}
export function useConnectWithInviteCode() {
  const queryClient = useQueryClient();

  return useMutation<AuthTokenData, Error, ConnectWithInviteCodeInput>({
    mutationFn: ({ accessToken, inviteCode }) =>
      connectWithInviteCode(accessToken, inviteCode),
    onSuccess: async (data) => {
      await saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
      });
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
    },
  });
}
