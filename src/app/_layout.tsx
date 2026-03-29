import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { fontFamily } from '@/constants/fonts';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    GangwonEduAllLight: require('../../assets/fonts/GangwonEduAll-Light.otf'),
    GangwonEduAllBold: require('../../assets/fonts/GangwonEduAll-Bold.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
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
      />
    </>
  );
}
