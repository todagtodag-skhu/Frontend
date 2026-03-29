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
          options={({ route }) => ({
            headerShown: true,
            title: '새 스티커판 만들기',
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  const childId =
                    route.params && 'childId' in route.params
                      ? route.params.childId
                      : undefined;

                  if (typeof childId === 'string' && childId.length > 0) {
                    router.replace({
                      pathname: '/child-detail',
                      params: { childId },
                    });
                    return;
                  }

                  router.replace('/children');
                }}
                style={{ paddingHorizontal: 16 }}
              >
                <Text>뒤로</Text>
              </Pressable>
            ),
          })}
        />
      </Stack>
    </GrowthProvider>
  );
}
