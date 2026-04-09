import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import {
  GROWTH_BOARD_VERTICAL_EDGE_INSET,
  GROWTH_GRID_ROWS,
} from '@/features/growth/constants';
import FoxImage from '../../../assets/foxImage.svg';
import MeowImage from '../../../assets/meowImage.svg';
import TigerImage from '../../../assets/tigerImage.svg';

type Mission = {
  id: string;
  emoji: string;
  title: string;
  completed: boolean;
};

type StickerInfo = {
  placedAt: Date;
  mission: Mission;
  stickerIdx: number;
};

export type GridCell = {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
};

type StickerGridBoardProps = {
  width: number;
  height: number;
  cells: GridCell[];
  placedStickers: Record<number, StickerInfo>;
  getScaleAnim: (id: number) => Animated.Value;
  onCellPress: (id: number) => void;
  onLayoutBoard: (layout: { x: number; y: number; width: number; height: number }) => void;
  onScrollOffsetChange?: (offsetY: number) => void;
  boardDesign?: string;
};

function MascotImage({ boardDesign }: { boardDesign?: string }) {
  if (boardDesign === 'meowImage') {
    return (
      <View style={styles.meowImageWrap}>
        <MeowImage width={190} height={106} />
      </View>
    );
  }

  if (boardDesign === 'tigerImage') {
    return <TigerImage width={146} height={96} />;
  }

  return <FoxImage width={146} height={96} />;
}

export function StickerGridBoard({
  width,
  height,
  cells,
  placedStickers,
  getScaleAnim,
  onCellPress,
  onLayoutBoard,
  onScrollOffsetChange,
  boardDesign,
}: StickerGridBoardProps) {
  const boardWrapRef = useRef<View>(null);
  const totalRows = cells.length > 0 ? Math.max(...cells.map((cell) => cell.row)) + 1 : 0;
  const visibleRows = Math.min(totalRows, GROWTH_GRID_ROWS);
  const rowGap =
    visibleRows === 1
      ? 0
      : (height - GROWTH_BOARD_VERTICAL_EDGE_INSET * 2) / (visibleRows - 1);
  const contentHeight =
    totalRows <= 1 ? height : GROWTH_BOARD_VERTICAL_EDGE_INSET * 2 + rowGap * (totalRows - 1);
  const handleMeasureBoard = useCallback(() => {
    boardWrapRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      onLayoutBoard({
        x,
        y,
        width: measuredWidth,
        height: measuredHeight,
      });
    });
  }, [onLayoutBoard]);

  return (
    <View style={styles.boardOutline}>
      <View style={styles.mascotWrap}>
        <MascotImage boardDesign={boardDesign} />
      </View>

      <View ref={boardWrapRef} style={[styles.boardWrap, { width, height }]} onLayout={handleMeasureBoard}>
        <ScrollView
          bounces={false}
          nestedScrollEnabled
          showsVerticalScrollIndicator={contentHeight > height}
          scrollEventThrottle={16}
          onScroll={(event) => onScrollOffsetChange?.(event.nativeEvent.contentOffset.y)}
          onContentSizeChange={handleMeasureBoard}
          contentContainerStyle={{ width, height: contentHeight }}
        >
          {cells.map((cell) => {
            const sticker = placedStickers[cell.id];
            const left = cell.x * width;
            const centerY =
              totalRows === 1 ? height / 2 : GROWTH_BOARD_VERTICAL_EDGE_INSET + cell.row * rowGap;

            return (
              <Pressable
                key={cell.id}
                onPress={() => onCellPress(cell.id)}
                style={[
                  styles.cellPressable,
                  {
                    left: left - 28,
                    top: centerY - 28,
                  },
                ]}
              >
                {sticker ? (
                  <Animated.View
                    style={[
                      styles.placedSticker,
                      {
                        transform: [{ scale: getScaleAnim(cell.id) }],
                      },
                    ]}
                  >
                    <View style={styles.placedStickerEmojiWrap}>
                      <Text style={styles.placedStickerEmoji}>{sticker.mission.emoji}</Text>
                    </View>
                  </Animated.View>
                ) : (
                  <View style={styles.emptyCellHint}>
                    <Text style={styles.emptyCellNumber}>{cell.id}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardWrap: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: colors.primary[800],
  },
  boardOutline: {
    paddingTop: 85,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'visible',
  },
  mascotWrap: {
    position: 'absolute',
    top: -3,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  meowImageWrap: {
    transform: [{ translateY: -3 }],
  },
  cellPressable: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCellHint: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCellNumber: {
    fontSize: 24,
    color: '#202020',
    fontFamily: fontFamily.bold,
  },
  placedSticker: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placedStickerEmojiWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placedStickerEmoji: {
    fontSize: 22,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
