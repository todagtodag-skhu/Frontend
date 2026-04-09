import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import GiftCard from '@/components/growth/GiftCard';
import { StickerInfoCard } from '@/components/growth/StickerInfoCard';
import { StickerGridBoard, type GridCell } from '@/components/growth/StickerGridBoard';
import { fontFamily } from '@/constants/fonts';
import {
  GROWTH_GRID_COLS,
  GROWTH_MEMORY_CAROUSEL_GAP,
  getGrowthBoardHeight,
  getGrowthBoardWidth,
  getGrowthMemoryCarouselCardWidth,
} from '@/features/growth/constants';
import { useCompletedGrowthStickerBoards } from '@/features/growth/hooks';
import { type CompletedStickerBoard } from '@/mocks/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAROUSEL_CARD_WIDTH = getGrowthMemoryCarouselCardWidth(SCREEN_WIDTH);
const BOARD_WIDTH = getGrowthBoardWidth(SCREEN_WIDTH);
const BOARD_HEIGHT = getGrowthBoardHeight(SCREEN_WIDTH);

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

function CompletedBoardCarouselCard({ board }: { board: CompletedStickerBoard }) {
  const scaleAnimsRef = useRef<Record<number, Animated.Value>>({});
  const [selectedSticker, setSelectedSticker] = useState<PreviewStickerInfo | null>(null);

  const gridCells: GridCell[] = useMemo(
    () =>
      Array.from({ length: board.stickers.length }, (_, index) => {
        const row = Math.floor(index / GROWTH_GRID_COLS);
        const col = index % GROWTH_GRID_COLS;

        return {
          id: index + 1,
          row,
          col,
          x: (col + 0.5) / GROWTH_GRID_COLS,
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
            emoji: sticker.emoji,
            title: sticker.title,
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
          onCellPress={(cellId) => setSelectedSticker(placedStickers[cellId] ?? null)}
          onLayoutBoard={() => undefined}
          boardDesign={board.boardDesign}
        />
      </View>

      <Modal visible={selectedSticker !== null} transparent animationType="fade">
        <Pressable style={styles.modalOverlayCenter} onPress={() => setSelectedSticker(null)}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.infoCardWrap}>
            <StickerInfoCard
              missionEmoji={selectedSticker?.mission.emoji ?? ''}
              missionTitle={selectedSticker?.mission.title ?? ''}
              onConfirm={() => setSelectedSticker(null)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const MemoryStorageScreen: React.FC = () => {
  const scrollRef = useRef<ScrollView>(null);
  const { data: boards = [], isLoading, error } = useCompletedGrowthStickerBoards();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentBoard = boards[selectedIndex] ?? boards[0];

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
      event.nativeEvent.contentOffset.x / (CAROUSEL_CARD_WIDTH + GROWTH_MEMORY_CAROUSEL_GAP),
    );

    setSelectedIndex(Math.max(0, Math.min(nextIndex, boards.length - 1)));
  };

  const moveCarousel = (direction: -1 | 1) => {
    const nextIndex = Math.max(0, Math.min(selectedIndex + direction, boards.length - 1));

    scrollRef.current?.scrollTo({
      x: nextIndex * (CAROUSEL_CARD_WIDTH + GROWTH_MEMORY_CAROUSEL_GAP),
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
            snapToInterval={CAROUSEL_CARD_WIDTH + GROWTH_MEMORY_CAROUSEL_GAP}
            decelerationRate="fast"
            disableIntervalMomentum
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleCarouselScrollEnd}
            contentContainerStyle={styles.carouselContent}
          >
            {boards.map((board) => (
              <CompletedBoardCarouselCard key={board.id} board={board} />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.arrowButton, styles.arrowRight]}
            onPress={() => moveCarousel(1)}
            disabled={selectedIndex === boards.length - 1 || boards.length === 0}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.arrowText,
                (selectedIndex === boards.length - 1 || boards.length === 0) && styles.arrowDisabled,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>스티커판 완료 보상 내용</Text>
        {error ? (
          <Text style={styles.sectionTitle}>{error.message}</Text>
        ) : isLoading ? (
          <Text style={styles.sectionTitle}>완성된 스티커판을 불러오는 중이에요.</Text>
        ) : currentBoard ? (
          <GiftCard label={currentBoard.reward} status="열기전" onPress={() => undefined} />
        ) : (
          <Text style={styles.sectionTitle}>아직 완성된 스티커판이 없어요.</Text>
        )}
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
    columnGap: GROWTH_MEMORY_CAROUSEL_GAP,
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
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  infoCardWrap: {
    width: '100%',
    maxWidth: 320,
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
