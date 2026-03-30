import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import CompletedStickerCard from '@/components/growth/CompletedCard';
import GiftCard from '@/components/growth/GiftCard';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── 타입 ──────────────────────────────────────────────────────────────────────
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
  isUnlocked: boolean;
}

interface Page {
  id: string;
  stickerBoards: StickerBoard[];
  gifts: Gift[];
}

// ── 더미 데이터 ───────────────────────────────────────────────────────────────
const PAGES: Page[] = [
  {
    id: 'page-1',
    stickerBoards: [
      { id: 'sb-1', date: '2025.01', title: '유진이의 스티커 판', filled: 30, total: 30 },
    ],
    gifts: [
      { id: 'g-1', label: '베스킨라빈스', status: '열기전', isUnlocked: true },
      { id: 'g-2', label: '베스킨라빈스', status: '열기전', isUnlocked: false },
    ],
  },
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
];

const TOTAL_COMPLETED = 12;

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────
const MemoryStorageScreen: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const renderPage = ({ item }: { item: Page }) => (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 완성된 스티커 판 섹션 */}
      <Text style={styles.sectionTitle}>완성된 스티커 판</Text>
      {item.stickerBoards.map((board) => (
        <CompletedStickerCard
          key={board.id}
          date={board.date}
          title={board.title}
          filled={board.filled}
          total={board.total}
          onReview={() => console.log('review:', board.id)}
        />
      ))}

      {/* 선물 보관함 섹션 */}
      <Text style={[styles.sectionTitle, { marginTop: 40 }]}>선물 보관함</Text>
      <View style={styles.giftRow}>
        {item.gifts.map((gift) => (
          <GiftCard
            key={gift.id}
            label={gift.label}
            status={gift.status}
            isUnlocked={gift.isUnlocked}
            onPress={() => console.log('open gift:', gift.id)}
          />
        ))}
        {/* gifts가 1개일 경우 빈 공간 채우기 */}
        {item.gifts.length % 2 !== 0 && <View style={{ flex: 1 }} />}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>추억 저장소</Text>
        <View style={styles.badge}>
          <Ionicons name="trophy" size={14} color={colors.grayscale[100]} style={styles.badgeIcon} />
          <Text style={styles.badgeText}>완료 {TOTAL_COMPLETED}개</Text>
        </View>
      </View>

      {/* 페이지 슬라이더 */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        keyExtractor={(item) => item.id}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* 페이지 인디케이터 */}
      <View style={styles.dotContainer}>
        {PAGES.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dot, currentPage === index && styles.dotActive]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index, animated: true });
              setCurrentPage(index);
            }}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

export default MemoryStorageScreen;

// ── 스타일 ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF6EE',
  },
  // ── 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    fontSize: 30,
    fontFamily: fontFamily.bold,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: fontFamily.bold,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5994E',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  badgeIcon: {
    marginTop: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  // ── FlatList
  flatList: {
    flex: 1,
  },
  // ── 페이지
  page: {
    width: SCREEN_WIDTH,
  },
  pageContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  // ── 섹션 타이틀
  sectionTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: '#555555',
    marginBottom: 24,
  },
  // ── 선물 행
  giftRow: {
    flexDirection: 'row',
    gap: 12,
  },
  // ── 페이지 인디케이터
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 8,
    gap: 70,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: '#D9D9D9',
  },
  dotActive: {
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: '#FBBF4E',
  },
});
