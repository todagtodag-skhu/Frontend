import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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
          fontFamily: fontFamily.bold,
        },
      }}
    >
      <Tabs.Screen
        name="tree"
        options={{
          title: '스티커판',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="MissionHome"
        options={{
          title: '미션 목록',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="MemoryStorage"
        options={{
          title: '완성된 스티커 판',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'crown' : 'crown-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
