import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';

const VERTICAL_SPACING_SCALE = 0.89;

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
  onLayoutBoard: () => void;
};

export function StickerGridBoard({
  width,
  height,
  cells,
  placedStickers,
  getScaleAnim,
  onCellPress,
  onLayoutBoard,
}: StickerGridBoardProps) {
  return (
    <View style={styles.boardOutline}>
      <View style={[styles.boardWrap, { width, height }]} onLayout={onLayoutBoard}>
        {cells.map((cell) => {
          const sticker = placedStickers[cell.id];
          const left = cell.x * width;
          const top = cell.y * height * VERTICAL_SPACING_SCALE + height * (1 - VERTICAL_SPACING_SCALE) * 0.5;

          return (
            <Pressable
              key={cell.id}
              onPress={() => onCellPress(cell.id)}
              style={[
                styles.cellPressable,
                {
                  left: left - 28,
                  top: top - 28,
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
                  <Text style={styles.placedStickerEmoji}>{sticker.mission.emoji}</Text>
                </Animated.View>
              ) : (
                <View style={styles.emptyCellHint}>
                  <Text style={styles.emptyCellNumber}>{cell.id}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
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
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#D9D9D9',
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
  placedStickerEmoji: {
    fontSize: 22,
    lineHeight: 24,
  },
});
