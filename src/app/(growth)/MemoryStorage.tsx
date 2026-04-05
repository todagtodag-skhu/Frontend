import React, { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  StyleProp,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import GiftCard from '@/components/growth/GiftCard';
import { fontFamily } from '@/constants/fonts';
import MeowImage from '../../../assets/meowImage.svg';
import FoxImage from '../../../assets/foxImage.svg';
import TigerImage from '../../../assets/tigerImage.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAROUSEL_CARD_WIDTH = SCREEN_WIDTH - 32;
const CAROUSEL_GAP = 19;
const BOARD_ROWS = 4;
const BOARD_COLS = 5;
const BOARD_PREVIEW_WIDTH = Math.min(SCREEN_WIDTH - 44, 320);
const CARD_HORIZONTAL_PADDING = 10;
const BOARD_OUTLINE_PADDING = 8;
const BOARD_HORIZONTAL_PADDING = 10;
const GRID_GAP = 10;
const GRID_ROW_GAP = 15;
const SLOT_SIZE =
  (BOARD_PREVIEW_WIDTH -
    BOARD_HORIZONTAL_PADDING * 2 -
    GRID_GAP * (BOARD_COLS - 1)) /
  BOARD_COLS;
const BOARD_PREVIEW_HEIGHT =
  SLOT_SIZE * BOARD_ROWS + GRID_ROW_GAP * (BOARD_ROWS - 1) + 28;

type StickerBoard = {
  id: string;
  title: string;
  reward: string;
  boardDesign: string;
  stickers: string[];
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

function MascotImage({ boardDesign }: { boardDesign: string }) {
  if (boardDesign === '우주 탐험') {
    return <MeowImage width={156} height={90} />;
  }

  if (boardDesign === '바다 여행') {
    return <TigerImage width={156} height={90} />;
  }

  return <FoxImage width={156} height={90} />;
}

function StickerSymbol({ symbol }: { symbol: string }) {
  if (symbol === '❤') {
    return <Ionicons name="heart" size={28} color="#F25C54" />;
  }

  if (symbol === '🦷') {
    return <MaterialCommunityIcons name="tooth-outline" size={25} color="#CDBAA1" />;
  }

  if (symbol === '☺') {
    return <Ionicons name="happy-outline" size={24} color="#707070" />;
  }

  if (symbol === '📚') {
    return <Ionicons name="book" size={24} color="#4C84FF" />;
  }

  if (symbol === '⭐') {
    return <Ionicons name="star" size={24} color="#FFB400" />;
  }

  if (symbol === '🧸') {
    return <MaterialCommunityIcons name="teddy-bear" size={24} color="#B9815D" />;
  }

  if (symbol === '✨') {
    return <Ionicons name="sparkles" size={22} color="#F4B53F" />;
  }

  return <Text style={styles.slotEmoji}>{symbol}</Text>;
}

function CompletedBoardCarouselCard({ board }: { board: StickerBoard }) {
  const rows = Array.from({ length: BOARD_ROWS }, (_, rowIndex) =>
    Array.from({ length: BOARD_COLS }, (_, colIndex) => {
      const stickerIndex = rowIndex * BOARD_COLS + colIndex;
      return board.stickers[stickerIndex] ?? '';
    }),
  );

  return (
    <View style={styles.carouselCard}>
      <Text style={styles.boardTitle}>{board.title}</Text>

      <View style={styles.previewWrap}>
        <View style={styles.mascotWrap}>
          <MascotImage boardDesign={board.boardDesign} />
        </View>

        <View style={styles.boardOutline}>
          <View style={styles.boardFrame}>
            {rows.map((row, rowIndex) => (
              <View
                key={`${board.id}-row-${rowIndex}`}
                style={[
                  styles.gridRow,
                  rowIndex < rows.length - 1 ? styles.gridRowSpacing : null,
                ]}
              >
                {row.map((symbol, colIndex) => (
                  <View
                    key={`${board.id}-${rowIndex}-${colIndex}`}
                    style={[
                      styles.stickerSlot,
                      colIndex < row.length - 1 ? styles.stickerSlotSpacing : null,
                    ]}
                  >
                    <StickerSymbol symbol={symbol} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
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
    paddingTop: 18,
    paddingRight: CARD_HORIZONTAL_PADDING,
    paddingBottom: 14,
    paddingLeft: CARD_HORIZONTAL_PADDING,
  },
  boardTitle: {
    fontSize: 17,
    color: '#4D453B',
    fontFamily: fontFamily.bold,
    marginBottom: 10,
  },
  previewWrap: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 76,
  },
  mascotWrap: {
    position: 'absolute',
    top: -6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  boardOutline: {
    width: BOARD_PREVIEW_WIDTH + BOARD_OUTLINE_PADDING * 2,
    paddingHorizontal: BOARD_OUTLINE_PADDING,
    paddingVertical: BOARD_OUTLINE_PADDING,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  boardFrame: {
    width: BOARD_PREVIEW_WIDTH,
    height: BOARD_PREVIEW_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#FFF2CF',
    paddingHorizontal: BOARD_HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 0,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridRowSpacing: {
    marginBottom: GRID_ROW_GAP,
  },
  stickerSlot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DFE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerSlotSpacing: {
    marginRight: GRID_GAP,
  },
  slotEmoji: {
    fontSize: 26,
    lineHeight: 30,
    textAlign: 'center',
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
