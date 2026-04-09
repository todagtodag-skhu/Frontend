import { useMutation } from '@tanstack/react-query';
import { signInWithApple, logout, withdraw } from './api';
import { saveAuthSession, clearAuthSession, getAuthSession } from './session';

export function useSocialLogin() {
  return useMutation({
    mutationFn: (token: string) => signInWithApple(token),
    onSuccess: async (data) => {
      await saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
      });
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const session = await getAuthSession();
      if (session?.refreshToken) {
        await logout(session.refreshToken);
      }
    },
    onSettled: async () => {
      await clearAuthSession();
    },
  });
}

export function useWithdraw() {
  return useMutation({
    mutationFn: withdraw,
    onSuccess: async () => {
      await clearAuthSession();
    },
  });
}
