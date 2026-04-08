import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import { LoginScreen } from '@/components/auth/LoginScreen';
import { signInWithApple } from '@/features/auth/api';
import { getPostLoginRoute } from '@/features/auth/routing';
import { saveAuthSession } from '@/features/auth/session';

export default function LoginRoute() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAppleLogin = async () => {
    try {
      setIsSubmitting(true);
      const isAppleLoginAvailable = await AppleAuthentication.isAvailableAsync();

      if (!isAppleLoginAvailable) {
        throw new Error('이 기기에서는 Apple 로그인을 사용할 수 없습니다.');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple 로그인 토큰이 없어 로그인할 수 없습니다.');
      }

      const result = await signInWithApple(credential.identityToken);

      await saveAuthSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        role: result.role,
      });

      const nextRoute = result.isNewUser ? '/onboarding' : getPostLoginRoute(result.role);
      router.replace(nextRoute);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ERR_REQUEST_CANCELED'
      ) {
        return;
      }

      const message =
        error instanceof Error ? error.message : '로그인에 실패했습니다. 다시 시도해주세요.';

      Alert.alert('로그인 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <LoginScreen isSubmitting={isSubmitting} onAppleLogin={handleAppleLogin} />;
}
