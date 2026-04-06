import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import GiftCard from '@/components/growth/GiftCard';
import { StickerGridBoard, type GridCell } from '@/components/growth/StickerGridBoard';
import { fontFamily } from '@/constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAROUSEL_CARD_WIDTH = SCREEN_WIDTH - 32;
const CAROUSEL_GAP = 19;
const BOARD_WIDTH = Math.min(SCREEN_WIDTH - 44, 320);
const BOARD_HEIGHT = BOARD_WIDTH * 1.08;
const BOARD_COLS = 5;

type StickerBoard = {
  id: string;
  title: string;
  reward: string;
  boardDesign: string;
  stickers: string[];
};

type PreviewStickerInfo = {
  placedAt: Date;
  mission: {
    id: string;
    emoji: string;
    title: string;
    completed: boolean;
  };
  stickerIdx: number;
};

const COMPLETED_BOARDS: StickerBoard[] = [
  {
    id: 'board-1',
    title: '유진이의 성장나무',
    reward: '닌텐도 스위치',
    boardDesign: '우주 탐험',
    stickers: ['❤', '🦷', '❤', '❤', '❤', '❤', '❤', '🦷', '🦷', '🦷', '❤', '❤', '❤', '❤', '❤', '☺', '🦷', '❤', '❤', '❤'],
  },
  {
    id: 'board-2',
    title: '유진이의 책 읽기판',
    reward: '새 그림책',
    boardDesign: '성장 나무',
    stickers: ['📚', '⭐', '📚', '⭐', '📚', '📚', '⭐', '📚', '⭐', '📚', '📚', '📚', '⭐', '📚', '⭐', '📚', '⭐', '📚', '📚', '⭐'],
  },
  {
    id: 'board-3',
    title: '유진이의 정리판',
    reward: '키즈카페 가기',
    boardDesign: '바다 여행',
    stickers: ['🧸', '🧸', '✨', '🧸', '✨', '🧸', '✨', '🧸', '🧸', '✨', '🧸', '🧸', '✨', '🧸', '✨', '🧸', '✨', '🧸', '🧸', '✨'],
  },
];

function CompletedBoardCarouselCard({ board }: { board: StickerBoard }) {
  const scaleAnimsRef = useRef<Record<number, Animated.Value>>({});

  const gridCells: GridCell[] = useMemo(
    () =>
      Array.from({ length: board.stickers.length }, (_, index) => {
        const row = Math.floor(index / BOARD_COLS);
        const col = index % BOARD_COLS;

        return {
          id: index + 1,
          row,
          col,
          x: (col + 0.5) / BOARD_COLS,
          y: row,
        };
      }),
    [board.stickers.length],
  );

  const placedStickers = useMemo<Record<number, PreviewStickerInfo>>(
    () =>
      board.stickers.reduce<Record<number, PreviewStickerInfo>>((acc, sticker, index) => {
        acc[index + 1] = {
          placedAt: new Date(),
          mission: {
            id: `${board.id}-mission-${index}`,
            emoji: sticker,
            title: sticker,
            completed: true,
          },
          stickerIdx: index,
        };

        return acc;
      }, {}),
    [board.id, board.stickers],
  );

  const getScaleAnim = useCallback((id: number) => {
    if (!scaleAnimsRef.current[id]) {
      scaleAnimsRef.current[id] = new Animated.Value(1);
    }

    return scaleAnimsRef.current[id];
  }, []);

  return (
    <View style={styles.carouselCard}>
      <Text style={styles.boardTitle}>{board.title}</Text>

      <View style={styles.boardPreviewWrap}>
        <StickerGridBoard
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          cells={gridCells}
          placedStickers={placedStickers}
          getScaleAnim={getScaleAnim}
          onCellPress={() => undefined}
          onLayoutBoard={() => undefined}
          boardDesign={board.boardDesign}
        />
      </View>
    </View>
  );
}

const MemoryStorageScreen: React.FC = () => {
  const scrollRef = useRef<ScrollView>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentBoard = COMPLETED_BOARDS[selectedIndex] ?? COMPLETED_BOARDS[0];

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

  const handleCarouselScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / (CAROUSEL_CARD_WIDTH + CAROUSEL_GAP),
    );

    setSelectedIndex(Math.max(0, Math.min(nextIndex, COMPLETED_BOARDS.length - 1)));
  };

  const moveCarousel = (direction: -1 | 1) => {
    const nextIndex = Math.max(0, Math.min(selectedIndex + direction, COMPLETED_BOARDS.length - 1));

    scrollRef.current?.scrollTo({
      x: nextIndex * (CAROUSEL_CARD_WIDTH + CAROUSEL_GAP),
      animated: true,
    });

    setSelectedIndex(nextIndex);
  };

  return (
    <SafeAreaView style={styles.safe} {...swipeResponder.panHandlers}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>완성된 스티커 판</Text>

        <View style={styles.carouselWrap}>
          <TouchableOpacity
            style={[styles.arrowButton, styles.arrowLeft]}
            onPress={() => moveCarousel(-1)}
            disabled={selectedIndex === 0}
            activeOpacity={0.8}
          >
            <Text style={[styles.arrowText, selectedIndex === 0 && styles.arrowDisabled]}>‹</Text>
          </TouchableOpacity>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled={false}
            snapToInterval={CAROUSEL_CARD_WIDTH + CAROUSEL_GAP}
            decelerationRate="fast"
            disableIntervalMomentum
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleCarouselScrollEnd}
            contentContainerStyle={styles.carouselContent}
          >
            {COMPLETED_BOARDS.map((board) => (
              <CompletedBoardCarouselCard key={board.id} board={board} />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.arrowButton, styles.arrowRight]}
            onPress={() => moveCarousel(1)}
            disabled={selectedIndex === COMPLETED_BOARDS.length - 1}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.arrowText,
                selectedIndex === COMPLETED_BOARDS.length - 1 && styles.arrowDisabled,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>스티커판 완료 보상 내용</Text>
        <GiftCard label={currentBoard.reward} status="열기전" onPress={() => undefined} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MemoryStorageScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8EA',
  },
  content: {
    paddingTop: 28,
    paddingBottom: 48,
    paddingHorizontal: 16,
  },
  pageTitle: {
    textAlign: 'center',
    fontSize: 20,
    color: '#58524A',
    fontFamily: fontFamily.bold,
    marginBottom: 24,
  },
  carouselWrap: {
    marginBottom: 26,
  },
  carouselContent: {
    paddingHorizontal: 0,
    columnGap: CAROUSEL_GAP,
  },
  carouselCard: {
    width: CAROUSEL_CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 14,
  },
  boardTitle: {
    fontSize: 17,
    color: '#4D453B',
    fontFamily: fontFamily.bold,
  },
  boardPreviewWrap: {
    alignItems: 'center',
  },
  arrowButton: {
    position: 'absolute',
    top: '48%',
    zIndex: 3,
    width: 20,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: {
    left: -6,
  },
  arrowRight: {
    right: -6,
  },
  arrowText: {
    fontSize: 28,
    color: '#1A1A1A',
  },
  arrowDisabled: {
    color: '#CFCFCF',
  },
  sectionTitle: {
    fontSize: 15,
    color: '#6D655E',
    fontFamily: fontFamily.bold,
    marginBottom: 12,
  },
});
