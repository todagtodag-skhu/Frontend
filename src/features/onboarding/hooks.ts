import { useMutation } from '@tanstack/react-query';
import { todakOnboarding, createSungjangInviteCode } from './api';
import { saveAuthSession } from '@/features/auth/session';

export function useTodakOnboarding() {
  return useMutation({
    mutationFn: (inviteCode: string) => todakOnboarding(inviteCode),
    onSuccess: async (data) => {
      await saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
      });
    },
  });
}

export function useCreateSungjangInviteCode() {
  return useMutation({
    mutationFn: createSungjangInviteCode,
  });
}
