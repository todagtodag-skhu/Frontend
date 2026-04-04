import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import CompletedStickerCard from '@/components/growth/CompletedCard';
import GiftCard from '@/components/growth/GiftCard';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StickerBoard {
  id: string;
  date: string;
  title: string;
  filled: number;
  total: number;
}

interface Gift {
  id: string;
  label: string;
  status: string;
}

interface Page {
  id: string;
  stickerBoards: StickerBoard[];
  gifts: Gift[];
}

const PAGES: Page[] = [
  {
    id: 'page-1',
    stickerBoards: [
      { id: 'sb-1', date: '2025.01', title: '유진이의 스티커 판', filled: 30, total: 30 },
    ],
    gifts: [
      { id: 'g-1', label: '베스킨라빈스', status: '열기전' },
    ],
  },
  /*
  {
    id: 'page-2',
    stickerBoards: [
      { id: 'sb-2', date: '2025.02', title: '유진이의 스티커 판', filled: 30, total: 30 },
    ],
    gifts: [
      { id: 'g-3', label: '스타벅스', status: '열기전', isUnlocked: true },
      { id: 'g-4', label: '편의점', status: '열기전', isUnlocked: false },
    ],
  },
  {
    id: 'page-3',
    stickerBoards: [
      { id: 'sb-3', date: '2025.03', title: '유진이의 스티커 판', filled: 30, total: 30 },
    ],
    gifts: [
      { id: 'g-5', label: '롯데리아', status: '열기전', isUnlocked: false },
      { id: 'g-6', label: '투썸', status: '열기전', isUnlocked: false },
    ],
  },
  */
];


const TOTAL_COMPLETED = 12;

const MemoryStorageScreen: React.FC = () => {
  const item = PAGES[0];
  const totalCompletedBoards = item.stickerBoards.length;

  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 24 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx >= 60) {
            router.push('/MissionHome');
          }
        },
      }),
    [],
  );

  return (
    <SafeAreaView style={styles.safe} {...swipeResponder.panHandlers}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>추억 저장소</Text>
        <View style={styles.badge}>
          <Ionicons name="trophy" size={12} color={colors.grayscale[100]} style={styles.badgeIcon} />
          <Text style={styles.badgeText}>완료한 판 : {totalCompletedBoards}개</Text>
        </View>
      </View>

      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>완성된 스티커 판</Text>
        <View style={styles.completedCardList}>
          {item.stickerBoards.map((board) => (
            <CompletedStickerCard
              key={board.id}
              date={board.date}
              title={board.title}
              filled={board.filled}
              total={board.total}
              onReview={() => router.push('/tree')}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.giftSectionTitle]}>스티커판 완료 보상 내용</Text>
        <View style={styles.giftColumn}>
          {item.gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              label={gift.label}
              status={gift.status}
              onPress={() => console.log('open gift:', gift.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.pagination}>
        <View style={styles.paginationDot} />
        <View style={[styles.paginationDot, styles.paginationDotActive]} />
        <View style={styles.paginationDot} />
      </View>
    </SafeAreaView>
  );
};

export default MemoryStorageScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8EA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 22,
  },
  headerTitle: {
    fontSize: 19,
    color: '#5C564E',
    fontFamily: fontFamily.bold,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8C05C',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  badgeIcon: {
    marginTop: 0,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  page: {
    flex: 1,
  },
  pageContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: '#6D655E',
    marginBottom: 16,
  },
  completedCardList: {
    gap: 14,
  },
  giftSectionTitle: {
    marginTop: 36,
  },
  giftColumn: {
    gap: 12,
  },
  pagination: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  paginationDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#ECE7DF',
  },
  paginationDotActive: {
    backgroundColor: '#F8D48C',
  },
});
