import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
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
import { type TreeMission } from '@/mocks/data';
import { useAttachGrowthSticker, useGrowthStickerBoard } from '@/features/growth/hooks';

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
const BOARD_WIDTH = Math.min(SCREEN_WIDTH - 44, 320);
const BOARD_HEIGHT = BOARD_WIDTH * 1.08;
const STICKERS_PER_PAGE = 4;

const GRID_ROWS = 4;
const GRID_COLS = 5;
const BOARD_VERTICAL_EDGE_INSET = 53;
const TAP_MOVE_THRESHOLD = 8;

function FloatingStickerIcon({ emoji }: { emoji?: string }) {
  return (
    <View style={styles.floatingStickerIconWrap}>
      <View style={styles.floatingStickerBackground} />
      {emoji ? <Text style={styles.floatingStickerEmoji}>{emoji}</Text> : null}
    </View>
  );
}

export default function GrowthTree({
  boardName = '유진이의 스티커판',
  reward = '닌텐도 DS 1시간 사용',
  missions = [],
}: TreeProps) {
  const { data: board, isLoading, error, refetch } = useGrowthStickerBoard();
  const attachStickerMutation = useAttachGrowthSticker();

  const resolvedBoardName = board?.title ?? boardName;
  const resolvedReward = board?.rewardText ?? reward;
  const resolvedBoardDesign = board?.boardDesign;
  const resolvedMissions = board
    ? board.missions.map((mission) => ({
        id: mission.id,
        emoji: mission.emoji,
        title: mission.title,
        completed: false,
      }))
    : missions;
  const totalSpots = board?.totalSpots || 20;

  const gridCells: GridCell[] = useMemo(() => {
    const cells: GridCell[] = [];

    for (let index = 0; index < totalSpots; index++) {
      const row = Math.floor(index / GRID_COLS);
      const col = index % GRID_COLS;

      cells.push({
        id: index + 1,
        row,
        col,
        x: (col + 0.5) / GRID_COLS,
        y: (row + 0.5) / GRID_ROWS,
      });
    }

    return cells;
  }, [totalSpots]);

  const [placedStickers, setPlacedStickers] = useState<Record<number, StickerInfo>>({});
  const [usedStickerIndices, setUsedStickerIndices] = useState<number[]>([]);
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
      setUsedStickerIndices([]);
      return;
    }

    const missionIndexMap = new Map(board.missions.map((mission, index) => [mission.id, index]));
    const nextPlacedStickers = board.placedStickers.reduce<Record<number, StickerInfo>>((acc, sticker) => {
      acc[sticker.cellId] = {
        placedAt: new Date(),
        mission: {
          id: sticker.missionId,
          emoji: sticker.emoji,
          title: sticker.title,
          completed: true,
        },
        stickerIdx: missionIndexMap.get(sticker.missionId) ?? 0,
      };

      return acc;
    }, {});

    setPlacedStickers(nextPlacedStickers);
    setUsedStickerIndices(
      board.placedStickers
        .map((sticker) => missionIndexMap.get(sticker.missionId))
        .filter((value): value is number => typeof value === 'number'),
    );
  }, [board]);

  const getScaleAnim = (id: number) => {
    if (!scaleAnims.current[id]) {
      scaleAnims.current[id] = new Animated.Value(1);
    }
    return scaleAnims.current[id];
  };

  const placedCount = Object.keys(placedStickers).length;

  const totalPages = Math.ceil(resolvedMissions.length / STICKERS_PER_PAGE);
  const pagedIndices = Array.from({ length: resolvedMissions.length })
    .map((_, i) => i)
    .slice(stickerPage * STICKERS_PER_PAGE, stickerPage * STICKERS_PER_PAGE + STICKERS_PER_PAGE);

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
    async (cellId: number, mission: Mission, stickerIdx: number) => {
      if (attachStickerMutation.isPending) {
        return;
      }

      placeSticker(cellId, mission, stickerIdx);
      setUsedStickerIndices((prev) => (prev.includes(stickerIdx) ? prev : [...prev, stickerIdx]));

      try {
        await attachStickerMutation.mutateAsync(cellId);
      } catch (error) {
        await refetch().catch(() => undefined);
        const message =
          error instanceof Error ? error.message : '스티커 부착에 실패했습니다.';
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
    const visibleRows = Math.min(totalRows, GRID_ROWS);
    const rowGap =
      visibleRows === 1 ? 0 : (height - BOARD_VERTICAL_EDGE_INSET * 2) / (visibleRows - 1);

    const relativeX = absoluteX - x;
    const relativeY = absoluteY - y + boardScrollOffsetY;

    if (relativeX < 0 || absoluteY - y < 0 || relativeX > width || absoluteY - y > height) {
      return null;
    }

    const col = Math.floor((relativeX / width) * GRID_COLS);
    const row =
      totalRows === 1
        ? 0
        : Math.round((relativeY - BOARD_VERTICAL_EDGE_INSET) / rowGap);

    if (row < 0 || row >= totalRows || col < 0 || col >= GRID_COLS) {
      return null;
    }

    const cellId = row * GRID_COLS + col + 1;

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
            const mission = resolvedMissions[idx];
            const moveX = Math.abs(gestureState.dx);
            const moveY = Math.abs(gestureState.dy);
            const isTapLike = moveX < TAP_MOVE_THRESHOLD && moveY < TAP_MOVE_THRESHOLD;

            setDraggingStickerIdx(null);
            setDragPos(null);

            if (typeof dropX !== 'number' || typeof dropY !== 'number' || !mission) return;

            if (isTapLike) {
              const firstCellId = getFirstAvailableCellId();

              if (firstCellId === null) return;

              void handleAttachSticker(firstCellId, mission, idx);
              return;
            }

            const cellId = getGridCellFromPoint(dropX, dropY);

            if (cellId === null) return;

            void handleAttachSticker(cellId, mission, idx);
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
    [getFirstAvailableCellId, getGridCellFromPoint, handleAttachSticker, measureBoard, resolvedMissions],
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

  return (
    <SafeAreaView style={styles.container} {...swipeResponder.panHandlers}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.title}>{resolvedBoardName}</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>보상 :</Text>
            <Text style={styles.rewardValue}>{resolvedReward}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 10, alignItems: 'center' }}>
          <Text style={styles.progressText}>
          완성까지 <Text style={styles.progressHighlight}>{placedCount}/{totalSpots}</Text> 개
        </Text>
        </View>

        {error ? (
          <Text style={styles.progressText}>{error.message}</Text>
        ) : isLoading ? (
          <Text style={styles.progressText}>스티커판을 불러오는 중이에요.</Text>
        ) : (
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
        )}

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
              const isUsed = usedStickerIndices.includes(idx);
              const isDraggingThis = draggingStickerIdx === idx;

              return (
                <View key={idx} style={styles.bigStickerOption}>
                  {!isUsed ? (
                    <Pressable {...getPanHandlers(idx)} style={styles.draggableArea}>
                      <View style={[styles.stickerCircle, isDraggingThis && { opacity: 0 }]}>
                        <FloatingStickerIcon emoji={resolvedMissions[idx]?.emoji} />
                      </View>
                    </Pressable>
                  ) : (
                    <View style={styles.usedSlot} />
                  )}
                </View>
              );
            })}

            {Array.from({ length: STICKERS_PER_PAGE - pagedIndices.length }).map((_, i) => (
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
            : `붙일 수 있는 스티커를 ${placedCount}개 가지고 있어요!`}
        </Text>

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
          <FloatingStickerIcon emoji={resolvedMissions[draggingStickerIdx]?.emoji} />
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
