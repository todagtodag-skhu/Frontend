import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui/Text';

export default function TodagiLayout() {
  const router = useRouter();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="register-child"
        options={{
          headerShown: true,
          title: '성장이 등록하기',
          headerLeft: () => (
            <Pressable onPress={() => router.replace('/children')} style={{ paddingHorizontal: 16 }}>
              <Text>뒤로</Text>
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
