import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import MissionCard from '@/components/growth/Missionlist';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

// ── 타입 ──────────────────────────────────────────────────────────────────────
interface Mission {
  id: string;
  title: string;
  frequency: string;
  reward: string;
}

interface Page {
  id: string;
  missions: Mission[];
}

// ── 더미 데이터 ───────────────────────────────────────────────────────────────
const PAGES: Page[] = [
  {
    id: 'page-1',
    missions: [
      { id: '1', title: '엄마한테 사랑한다고 말하기', frequency: '주 1회', reward: '스티커 1개' },
      { id: '2', title: '엄마한테 사랑한다고 말하기', frequency: '주 1회', reward: '스티커 1개' },
      { id: '3', title: '엄마한테 사랑한다고 말하기', frequency: '주 1회', reward: '스티커 1개' },
      { id: '4', title: '엄마한테 사랑한다고 말하기', frequency: '주 1회', reward: '스티커 1개' },
      { id: '5', title: '엄마한테 사랑한다고 말하기', frequency: '주 1회', reward: '스티커 1개' },
      { id: '6', title: '하루 30분 독서하기', frequency: '매일', reward: '스티커 2개' },
      { id: '7', title: '방 청소하기', frequency: '주 2회', reward: '스티커 1개' },
    ],
  },
];

const PROGRESS_CURRENT = 1;
const PROGRESS_TOTAL = 20;

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────
const MissionListScreen: React.FC = () => {
  const item = PAGES[0];

  const handleDotPress = (index: number) => {
    if (index === 0) {
      router.push('/tree');
      return;
    }

    if (index === 2) {
      router.push('/MemoryStorage');
    }
  };

  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 24 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx <= -60) {
            router.push('/MemoryStorage');
            return;
          }

          if (gestureState.dx >= 60) {
            router.push('/tree');
          }
        },
      }),
    [],
  );

  return (
    <SafeAreaView style={styles.safe} {...swipeResponder.panHandlers}>
      <View style={styles.container}>
        {/* 헤더 */}
        <Text style={styles.header}>유진이의 미션 목록</Text>

        <View style={styles.page}>
      {/* 페이지 상단 대표 카드 */}
      <View style={styles.heroCard} >
        <Ionicons name="heart" size={22} color="red" style={styles.heroEmoji} />
        <View style={{ flex: 1 }} />
        <Ionicons name="heart" size={22} color="red" style={styles.heroEmoji} />  
      </View>

      {/* 미션 카드 목록 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.missionList}
      >
        {item.missions.map((mission) => (
          <MissionCard
            key={mission.id}
            title={mission.title}
            frequency={mission.frequency}
            reward={mission.reward}
            onHeartPress={() => console.log('heart pressed:', mission.id)}
          />
        ))}
      </ScrollView>

      {/* 성장 진행 텍스트 */}
      <Text style={styles.progressText}>
        성장나무 완성까지{' '}
          {PROGRESS_CURRENT}/{PROGRESS_TOTAL} 개
      </Text>
        </View>

        {/* 하단 네비게이션 도트 */}
        <View style={styles.dotContainer}>
          {[0, 1, 2].map((index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, index === 1 && styles.dotActive]}
              onPress={() => handleDotPress(index)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MissionListScreen;

// ── 스타일 ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF6EE',
  },
  container: {
    flex: 1,
  },
  // ── 헤더
  header: {
    fontSize: 30,
    fontFamily: fontFamily.bold,
    color: '#1A1A1A',
    textAlign: 'center',
    paddingTop: 36,
    paddingBottom: 32,
  },
  // ── 페이지 단위
  page: {
    paddingHorizontal: 20,
    flex: 1,
  },
  // ── 대표 히어로 카드
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[900],
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderColor: colors.grayscale[300],
    borderWidth: 1,
  },
  heroEmoji: {
    marginHorizontal: 2,
  },
  // ── 미션 리스트
  missionList: {
    paddingBottom: 8,
  },
  // ── 진행 텍스트
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#3578FF',
    marginTop: 0,
    marginBottom: 50,
  },
  progressHighlight: {
    color: '#4DA8E0',
    fontFamily: fontFamily.bold,
  },
  // ── 페이지 인디케이터 도트
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    gap: 70,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: '#D9D9D9',
  },
  dotActive: {
    backgroundColor: '#FBBF4E',
    width: 16,
    height: 16,
    borderRadius: 16,
  },
});
