import { Tabs } from 'expo-router';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/fonts';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          fontFamily: fontFamily.bold,
        },
        headerBackTitleStyle: {
          fontFamily: fontFamily.regular,
        },
        tabBarActiveTintColor: colors.grayscale[1000],
        tabBarInactiveTintColor: colors.grayscale[500],
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.grayscale[100],
          borderTopColor: '#F0E6D4',
        },
        tabBarLabelStyle: {
          fontSize: 13,
        },
      }}
    >
      <Tabs.Screen
        name="children"
        options={{
          title: '성장이 관리',
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
        }}
      />
    </Tabs>
  );
}
