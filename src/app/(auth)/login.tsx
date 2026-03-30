import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { LoginScreen } from '@/components/auth/LoginScreen';
import { signInWithApple } from '@/features/auth/api';

export default function LoginRoute() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAppleLogin = async () => {
    try {
      setIsSubmitting(true);
      await signInWithApple();
      router.replace('/onboarding');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '로그인에 실패했습니다. 다시 시도해주세요.';

      Alert.alert('로그인 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <LoginScreen isSubmitting={isSubmitting} onAppleLogin={handleAppleLogin} />;
}
