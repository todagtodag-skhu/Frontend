import { Tabs } from 'expo-router';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/fonts';

export default function GrowthTabsLayout() {
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
        name="tree"
        options={{
          title: '성장나무',
        }}
      />
      <Tabs.Screen
        name="MissionHome"
        options={{
          title: '미션 목록',
        }}
      />
      <Tabs.Screen
        name="MemoryStorage"
        options={{
          title: '완성된 스티커 판',
        }}
      />
    </Tabs>
  );
}
