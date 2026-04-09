import { forwardRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import TreeSvg from '../../../assets/tree.svg';

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

type SpotLayout = {
  x: number;
  y: number;
};

type TreeBoardProps = {
  width: number;
  height: number;
  spotSize: number;
  spots: SpotLayout[];
  placedStickers: Record<number, StickerInfo>;
  getScaleAnim: (id: number) => Animated.Value;
  onSpotPress: (spotId: number) => void;
  onLayout: () => void;
};

const STICKER_ICON_OUTLINE_SIZE = 42;

function StickerIcon({ emoji }: { emoji?: string }) {
  return (
    <View style={styles.stickerIconWrap}>
      <View style={styles.iconBackground} />
      {emoji ? <Text style={styles.stickerEmoji}>{emoji}</Text> : null}
    </View>
  );
}

export const TreeBoard = forwardRef<View, TreeBoardProps>(function TreeBoard(
  { width, height, spotSize, spots, placedStickers, getScaleAnim, onSpotPress, onLayout },
  ref,
) {
  return (
    <View ref={ref} style={[styles.treeWrapper, { width, height }]} onLayout={onLayout}>
      <TreeSvg width={width} height={height} style={styles.treeSvg} />

      {spots.map((pos, index) => {
        const spotId = index + 1;
        const placed = placedStickers[spotId];
        const scaleAnim = getScaleAnim(spotId);
        const left = pos.x * width - spotSize / 2;
        const top = pos.y * height - spotSize / 2;

        return (
          <TouchableOpacity
            key={spotId}
            activeOpacity={0.8}
            onPress={() => onSpotPress(spotId)}
            style={[
              styles.spot,
              { left, top, width: spotSize, height: spotSize, borderRadius: spotSize / 2 },
            ]}
          >
            {placed ? (
              <Animated.View
                style={[
                  styles.placedStickerCircle,
                  {
                    width: spotSize,
                    height: spotSize,
                    borderRadius: spotSize / 2,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <StickerIcon emoji={placed.mission.emoji} />
              </Animated.View>
            ) : (
              <View
                style={[
                  styles.emptySpot,
                  { width: spotSize, height: spotSize, borderRadius: spotSize / 2 },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  treeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeSvg: {
    position: 'absolute',
  },
  spot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySpot: {
    backgroundColor: '#D8D8D8',
  },
  placedStickerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  stickerIconWrap: {
    width: STICKER_ICON_OUTLINE_SIZE,
    height: STICKER_ICON_OUTLINE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  stickerEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
});
