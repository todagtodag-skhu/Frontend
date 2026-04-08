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

// ─── 소셜 로그인 ───────────────────────────────────────────────────────────────

/**
 * Apple 소셜 로그인
 * 성공 시 세션을 저장하고 AuthTokenData를 반환합니다.
 */
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

// ─── 토큰 재발급 ───────────────────────────────────────────────────────────────

/**
 * Access Token 재발급
 * 실패 시 세션이 자동으로 삭제됩니다.
 */
export function useRefreshToken() {
  return useMutation<string, Error, void>({
    mutationFn: () => refreshAccessToken(),
  });
}

// ─── 로그아웃 ──────────────────────────────────────────────────────────────────

/**
 * 로그아웃
 * 서버 실패 여부와 관계없이 로컬 세션을 삭제합니다.
 */
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

// ─── 회원 탈퇴 ─────────────────────────────────────────────────────────────────

/**
 * 회원 탈퇴
 * 성공/실패 여부와 관계없이 로컬 세션을 삭제합니다.
 */
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

// ─── 온보딩: 성장이 초대코드 발급 ────────────────────────────────────────────

/**
 * 성장이 온보딩 초대코드 생성 (PENDING 권한 필요)
 */
export function useRequestSungjangInviteCode() {
  return useMutation<InviteCodeResponse, Error, string>({
    mutationFn: (accessToken: string) => requestSungjangInviteCode(accessToken),
  });
}

// ─── 온보딩: 토닥이 초대코드 연결 ────────────────────────────────────────────

interface ConnectWithInviteCodeInput {
  accessToken: string;
  inviteCode: string;
}

/**
 * 토닥이 온보딩 - 초대코드로 성장이와 연결 (PENDING 권한 필요)
 * 성공 시 새 토큰으로 세션을 갱신합니다.
 */
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
