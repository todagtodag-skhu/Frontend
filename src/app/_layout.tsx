import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { fontFamily } from '@/constants/fonts';
import { GrowthProvider } from '@/contexts/GrowthContext';
import { Text } from '@/components/ui/Text';

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    GangwonEduAllLight: require('../../assets/fonts/GangwonEduAll-Light.otf'),
    GangwonEduAllBold: require('../../assets/fonts/GangwonEduAll-Bold.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GrowthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerTitleStyle: {
            fontFamily: fontFamily.bold,
          },
          headerBackTitleStyle: {
            fontFamily: fontFamily.regular,
          },
        }}
      >
        <Stack.Screen
          name="child-detail"
          options={{
            headerShown: true,
            title: '성장이 상세',
            headerLeft: () => (
              <Pressable onPress={() => router.replace('/children')} style={{ paddingHorizontal: 16 }}>
                <Text>뒤로</Text>
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="create-sticker"
          options={({ route }) => {
            const params = route.params as Record<string, string> | undefined;
            const isMissionsMode = params?.mode === 'missions';
            const hasBoardId = typeof params?.boardId === 'string' && params.boardId.length > 0;

            const title = isMissionsMode
              ? '미션 관리하기'
              : hasBoardId
              ? '스티커판 수정하기'
              : '스티커판 만들기';

            return {
              headerShown: true,
              title,
              headerLeft: () => (
                <Pressable
                  onPress={() => {
                    const returnTo = params?.returnTo;
                    const childId = params?.childId;

                    if (returnTo === 'child-detail' && typeof childId === 'string' && childId.length > 0) {
                      router.replace({ pathname: '/child-detail', params: { childId } });
                      return;
                    }

                    router.replace('/children');
                  }}
                  style={{ paddingHorizontal: 16 }}
                >
                  <Text>{isMissionsMode ? '취소' : '뒤로'}</Text>
                </Pressable>
              ),
            };
          }}
        />
      </Stack>
    </GrowthProvider>
  );
}
