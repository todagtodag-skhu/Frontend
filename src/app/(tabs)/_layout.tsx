import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/fonts';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontFamily: fontFamily.bold,
        },
        headerBackTitleStyle: {
          fontFamily: fontFamily.regular,
        },
        headerStyle: {
          backgroundColor: colors.grayscale[100],
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
        name="children"
        options={{
          title: '스티커판 관리',
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
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
