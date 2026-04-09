import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { router } from 'expo-router';

import { StickerGridBoard, type GridCell } from '@/components/growth/StickerGridBoard';
import { StickerInfoCard } from '@/components/growth/StickerInfoCard';
import { fontFamily } from '@/constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GROWTH_BOARD_VERTICAL_EDGE_INSET,
  GROWTH_GRID_COLS,
  GROWTH_GRID_ROWS,
  GROWTH_STICKER_PAGE_SIZE,
  GROWTH_STICKER_TAP_MOVE_THRESHOLD,
  getGrowthBoardHeight,
  getGrowthBoardWidth,
} from '@/features/growth/constants';
import {
  useAttachGrowthSticker,
  useGrowthStickerBoard,
} from '@/features/growth/hooks';
import type { GrowthAvailableSticker, GrowthStickerPlacement } from '@/features/growth/api';
import { type TreeMission } from '@/mocks/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Mission = TreeMission;

interface StickerInfo {
  placedAt: Date;
  mission: Mission;
  stickerIdx: number;
}

interface TreeProps {
  boardName?: string;
  reward?: string;
  missions?: Mission[];
  onRequestSticker?: () => void;
}

const BG_COLOR = '#FFF9EE';
const BLUE_TEXT = '#4C84FF';
const BOARD_WIDTH = getGrowthBoardWidth(SCREEN_WIDTH);
const BOARD_HEIGHT = getGrowthBoardHeight(SCREEN_WIDTH);

function FloatingStickerIcon({ emoji }: { emoji?: string }) {
  return (
    <View style={styles.floatingStickerIconWrap}>
      <View style={styles.floatingStickerBackground} />
      {emoji ? <Text style={styles.floatingStickerEmoji}>{emoji}</Text> : null}
    </View>
  );
}

function isFallbackStickerTitle(title?: string) {
  return !title || /^스티커 \d+$/.test(title);
}

function buildPlacedStickerMap(
  stickers: GrowthStickerPlacement[],
  missionIndexMap: Map<string, number>,
  previousPlacedStickers: Record<number, StickerInfo>,
) {
  return stickers.reduce<Record<number, StickerInfo>>((acc, sticker) => {
    const previousSticker = previousPlacedStickers[sticker.cellId];
    const resolvedTitle =
      isFallbackStickerTitle(sticker.title) && previousSticker?.mission.title
        ? previousSticker.mission.title
        : sticker.title;
    const resolvedEmoji =
      sticker.emoji || previousSticker?.mission.emoji || '⭐';

    acc[sticker.cellId] = {
      placedAt: previousSticker?.placedAt ?? new Date(),
      mission: {
        id: sticker.missionId,
        emoji: resolvedEmoji,
        title: resolvedTitle,
        completed: true,
      },
      stickerIdx: missionIndexMap.get(sticker.missionId) ?? previousSticker?.stickerIdx ?? 0,
    };

    return acc;
  }, {});
}

export default function GrowthTree({
  boardName,
  reward,
  missions = [],
}: TreeProps) {
  const { data: board, isLoading, error, refetch } = useGrowthStickerBoard();
  const attachStickerMutation = useAttachGrowthSticker();
  const isFocused = useIsFocused();

  const resolvedBoardName = board?.title ?? boardName ?? '';
  const resolvedReward = board?.rewardText ?? reward ?? '';
  const resolvedBoardDesign = board?.boardDesign;
  const resolvedMissions = board
    ? board.missions.map((mission) => ({
        id: mission.id,
        emoji: mission.emoji,
        title: mission.title,
        completed: false,
      }))
    : missions;
  const totalSpots = board?.totalSpots ?? 0;

  const gridCells: GridCell[] = useMemo(() => {
    const cells: GridCell[] = [];

    for (let index = 0; index < totalSpots; index++) {
      const row = Math.floor(index / GROWTH_GRID_COLS);
      const col = index % GROWTH_GRID_COLS;

      cells.push({
        id: index + 1,
        row,
        col,
        x: (col + 0.5) / GROWTH_GRID_COLS,
        y: (row + 0.5) / GROWTH_GRID_ROWS,
      });
    }

    return cells;
  }, [totalSpots]);

  const [placedStickers, setPlacedStickers] = useState<Record<number, StickerInfo>>({});
  const [availableStickers, setAvailableStickers] = useState<GrowthAvailableSticker[]>([]);
  const [stickerPage, setStickerPage] = useState(0);
  const [draggingStickerIdx, setDraggingStickerIdx] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [boardScrollOffsetY, setBoardScrollOffsetY] = useState(0);
  const [infoModal, setInfoModal] = useState<{ visible: boolean; spotId?: number; data?: StickerInfo }>({
    visible: false,
  });

  const boardLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const scaleAnims = useRef<Record<number, Animated.Value>>({});
  const placedStickersRef = useRef(placedStickers);
  placedStickersRef.current = placedStickers;

  useEffect(() => {
    if (!board) {
      setPlacedStickers({});
      setAvailableStickers([]);
      return;
    }

    const missionIndexMap = new Map(board.missions.map((mission, index) => [mission.id, index]));
    setPlacedStickers((previousPlacedStickers) =>
      buildPlacedStickerMap(board.placedStickers, missionIndexMap, previousPlacedStickers),
    );
    setAvailableStickers(board.availableStickers);
    setStickerPage(0);
  }, [board]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refetch();
  }, [isFocused, refetch]);

  const getScaleAnim = (id: number) => {
    if (!scaleAnims.current[id]) {
      scaleAnims.current[id] = new Animated.Value(1);
    }
    return scaleAnims.current[id];
  };

  const placedCount = Object.keys(placedStickers).length;

  const availableStickerCount = availableStickers.length;
  const totalPages = Math.max(1, Math.ceil(availableStickerCount / GROWTH_STICKER_PAGE_SIZE));
  const pagedIndices = Array.from({ length: availableStickerCount })
    .map((_, i) => i)
    .slice(
      stickerPage * GROWTH_STICKER_PAGE_SIZE,
      stickerPage * GROWTH_STICKER_PAGE_SIZE + GROWTH_STICKER_PAGE_SIZE,
    );

  const measureBoard = useCallback((layout: { x: number; y: number; width: number; height: number }) => {
    boardLayoutRef.current = layout;
  }, []);

  const placeSticker = useCallback((cellId: number, mission: Mission, stickerIdx: number) => {
    const anim = getScaleAnim(cellId);
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      friction: 5,
      tension: 160,
      useNativeDriver: true,
    }).start();

    setPlacedStickers((prev) => ({
      ...prev,
      [cellId]: {
        placedAt: new Date(),
        mission,
        stickerIdx,
      },
    }));
  }, []);

  const handleAttachSticker = useCallback(
    async (cellId: number, sticker: GrowthAvailableSticker, stickerIdx: number) => {
      if (attachStickerMutation.isPending) {
        return;
      }

      placeSticker(
        cellId,
        {
          id: sticker.missionId,
          emoji: sticker.emoji,
          title: sticker.title,
          completed: true,
        },
        stickerIdx,
      );
      setAvailableStickers((prev) => prev.filter((item) => item.id !== sticker.id));

      try {
        await attachStickerMutation.mutateAsync(cellId);
      } catch (attachError) {
        await refetch().catch(() => undefined);
        const message =
          attachError instanceof Error ? attachError.message : '스티커 부착에 실패했습니다.';
        Alert.alert('부착 실패', message);
      }
    },
    [attachStickerMutation, placeSticker, refetch],
  );

  const getFirstAvailableCellId = useCallback(() => {
    for (const cell of gridCells) {
      if (!placedStickersRef.current[cell.id]) {
        return cell.id;
      }
    }

    return null;
  }, [gridCells]);

  const getGridCellFromPoint = useCallback((absoluteX: number, absoluteY: number): number | null => {
    const { x, y, width, height } = boardLayoutRef.current;

    if (width <= 0 || height <= 0) {
      return null;
    }

    const totalRows = Math.max(...gridCells.map((cell) => cell.row)) + 1;
    const visibleRows = Math.min(totalRows, GROWTH_GRID_ROWS);
    const rowGap =
      visibleRows === 1
        ? 0
        : (height - GROWTH_BOARD_VERTICAL_EDGE_INSET * 2) / (visibleRows - 1);

    const relativeX = absoluteX - x;
    const relativeY = absoluteY - y + boardScrollOffsetY;

    if (relativeX < 0 || absoluteY - y < 0 || relativeX > width || absoluteY - y > height) {
      return null;
    }

    const col = Math.floor((relativeX / width) * GROWTH_GRID_COLS);
    const row =
      totalRows === 1
        ? 0
        : Math.round((relativeY - GROWTH_BOARD_VERTICAL_EDGE_INSET) / rowGap);

    if (row < 0 || row >= totalRows || col < 0 || col >= GROWTH_GRID_COLS) {
      return null;
    }

    const cellId = row * GROWTH_GRID_COLS + col + 1;

    if (placedStickersRef.current[cellId]) return null;

    return cellId;
  }, [boardScrollOffsetY, gridCells]);

  const panHandlersMap = useRef<Record<number, ReturnType<typeof PanResponder.create>['panHandlers']>>({});

  const getPanHandlers = useCallback(
    (idx: number) => {
      if (!panHandlersMap.current[idx]) {
        const responder = PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderTerminationRequest: () => false,

          onPanResponderGrant: (evt) => {
            const pageX = evt?.nativeEvent?.pageX;
            const pageY = evt?.nativeEvent?.pageY;

            setDraggingStickerIdx(idx);

            if (typeof pageX === 'number' && typeof pageY === 'number') {
              setDragPos({ x: pageX, y: pageY });
            }
          },

          onPanResponderMove: (evt) => {
            const pageX = evt?.nativeEvent?.pageX;
            const pageY = evt?.nativeEvent?.pageY;

            if (typeof pageX === 'number' && typeof pageY === 'number') {
              setDragPos({ x: pageX, y: pageY });
            }
          },

          onPanResponderRelease: (evt, gestureState) => {
            const dropX = evt?.nativeEvent?.pageX;
            const dropY = evt?.nativeEvent?.pageY;
            const sticker = availableStickers[idx];
            const moveX = Math.abs(gestureState.dx);
            const moveY = Math.abs(gestureState.dy);
            const isTapLike =
              moveX < GROWTH_STICKER_TAP_MOVE_THRESHOLD &&
              moveY < GROWTH_STICKER_TAP_MOVE_THRESHOLD;

            setDraggingStickerIdx(null);
            setDragPos(null);

            if (typeof dropX !== 'number' || typeof dropY !== 'number' || !sticker) return;

            if (isTapLike) {
              const firstCellId = getFirstAvailableCellId();

              if (firstCellId === null) return;

              void handleAttachSticker(firstCellId, sticker, idx);
              return;
            }

            const cellId = getGridCellFromPoint(dropX, dropY);

            if (cellId === null) return;

            void handleAttachSticker(cellId, sticker, idx);
          },

          onPanResponderTerminate: () => {
            setDraggingStickerIdx(null);
            setDragPos(null);
          },
        });

        panHandlersMap.current[idx] = responder.panHandlers;
      }

      return panHandlersMap.current[idx];
    },
    [availableStickers, getFirstAvailableCellId, getGridCellFromPoint, handleAttachSticker],
  );

  const handleCellPress = (id: number) => {
    if (placedStickers[id]) {
      setInfoModal({
        visible: true,
        spotId: id,
        data: placedStickers[id],
      });
    }
  };

  const handleInfoModalClose = () => {
    setInfoModal({ visible: false });
  };

  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
        onPanResponderRelease: (_, g) => {
          if (g.dx <= -60) router.push('/MissionHome');
        },
      }),
    [],
  );

  const hasConnectedBoard = Boolean(board && totalSpots > 0);

  return (
    <SafeAreaView style={styles.container} {...swipeResponder.panHandlers}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          {resolvedBoardName ? <Text style={styles.title}>{resolvedBoardName}</Text> : null}
          {resolvedReward ? (
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>보상 :</Text>
              <Text style={styles.rewardValue}>{resolvedReward}</Text>
            </View>
          ) : null}
        </View>

        <View style={{ marginBottom: 10, alignItems: 'center' }}>
          <Text style={styles.progressText}>
            완성까지 <Text style={styles.progressHighlight}>{placedCount}/{totalSpots}</Text> 개
          </Text>
        </View>

        {error ? (
          <Text style={styles.progressText}>{error.message}</Text>
        ) : !isLoading && !hasConnectedBoard ? (
          <View style={styles.emptyBoardCard}>
            <Text style={styles.emptyBoardTitle}>아직 스티커판이 없어요!</Text>
          </View>
        ) : isLoading ? (
          <Text style={styles.progressText}>스티커판을 불러오는 중이에요.</Text>
        ) : (
          <>
            <StickerGridBoard
              width={BOARD_WIDTH}
              height={BOARD_HEIGHT}
              cells={gridCells}
              placedStickers={placedStickers}
              getScaleAnim={getScaleAnim}
              onCellPress={handleCellPress}
              onLayoutBoard={measureBoard}
              onScrollOffsetChange={setBoardScrollOffsetY}
              boardDesign={resolvedBoardDesign}
            />

            {availableStickerCount > 0 ? (
              <>
                <View style={styles.stickerPickerWrap}>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    disabled={stickerPage === 0}
                    onPress={() => setStickerPage((p) => Math.max(p - 1, 0))}
                  >
                    <Text style={[styles.arrowText, stickerPage === 0 && styles.arrowDisabled]}>‹</Text>
                  </TouchableOpacity>

                  <View style={styles.stickerPickerInner}>
                    {pagedIndices.map((idx) => {
                      const isDraggingThis = draggingStickerIdx === idx;

                      return (
                        <View key={availableStickers[idx]?.id ?? idx} style={styles.bigStickerOption}>
                          <Pressable {...getPanHandlers(idx)} style={styles.draggableArea}>
                            <View style={[styles.stickerCircle, isDraggingThis && { opacity: 0 }]}>
                              <FloatingStickerIcon emoji={availableStickers[idx]?.emoji} />
                            </View>
                          </Pressable>
                        </View>
                      );
                    })}

                    {Array.from({ length: GROWTH_STICKER_PAGE_SIZE - pagedIndices.length }).map((_, i) => (
                      <View key={`dummy-${i}`} style={styles.bigStickerOption} />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.arrowBtn}
                    disabled={stickerPage === totalPages - 1}
                    onPress={() => setStickerPage((p) => Math.min(p + 1, totalPages - 1))}
                  >
                    <Text style={[styles.arrowText, stickerPage === totalPages - 1 && styles.arrowDisabled]}>
                      ›
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.stickerCountText}>
                  {attachStickerMutation.isPending
                    ? '스티커를 붙이는 중이에요...'
                    : `붙일 수 있는 스티커를 ${availableStickerCount}개 가지고 있어요!`}
                </Text>
              </>
            ) : null}
          </>
        )}
      </View>

      {draggingStickerIdx !== null && dragPos && (
        <View
          pointerEvents="none"
          style={[
            styles.draggingSticker,
            {
              left: dragPos.x - 27,
              top: dragPos.y - 27,
            },
          ]}
        >
          <FloatingStickerIcon emoji={availableStickers[draggingStickerIdx]?.emoji} />
        </View>
      )}

      <Modal visible={infoModal.visible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlayCenter}
          onPress={() => setInfoModal({ visible: false })}
        >
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.infoCardWrap}>
            <StickerInfoCard
              missionEmoji={infoModal.data?.mission.emoji ?? ''}
              missionTitle={infoModal.data?.mission.title ?? ''}
              onConfirm={handleInfoModalClose}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  content: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 22,
    alignItems: 'center',
    flex: 1,
  },

  topSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontFamily: fontFamily?.bold || 'System',
    color: '#1B1B1B',
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: -5,
  },
  rewardLabel: {
    fontSize: 16,
    fontFamily: fontFamily?.bold || 'System',
    color: BLUE_TEXT,
  },
  rewardValue: {
    fontSize: 16,
    fontFamily: fontFamily?.bold || 'System',
    color: BLUE_TEXT,
  },
  progressText: {
    fontSize: 16,
    fontFamily: fontFamily?.bold || 'System',
    color: BLUE_TEXT,
    textAlign: 'center',
    marginBottom: 5,
  },
  progressHighlight: {
    fontFamily: fontFamily?.bold || 'System',
  },
  emptyBoardCard: {
    width: '86%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  emptyBoardTitle: {
    fontSize: 22,
    lineHeight: 30,
    color: '#1F1A17',
    fontFamily: fontFamily?.bold || 'System',
    textAlign: 'center',
  },

  stickerPickerWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  stickerCountText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
    color: BLUE_TEXT,
    fontFamily: fontFamily?.bold || 'System',
  },

  arrowBtn: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 28,
    color: '#111',
    fontWeight: '400',
  },
  arrowDisabled: {
    color: '#CFCFCF',
  },

  stickerPickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
  },
  bigStickerOption: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggableArea: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  floatingStickerIconWrap: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingStickerBackground: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#D9D9D9',
  },
  floatingStickerEmoji: {
    fontSize: 22,
    lineHeight: 24,
  },

  usedSlot: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#D9D9D9',
    opacity: 0.35,
  },

  draggingSticker: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 999,
  },

  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoCardWrap: {
    width: '46%',
  },
});
