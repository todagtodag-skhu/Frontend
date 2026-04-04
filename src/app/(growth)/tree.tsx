import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
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
import { useGrowth } from '@/contexts/GrowthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Mission {
  id: string;
  emoji: string;
  title: string;
  completed: boolean;
}

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

const DEFAULT_MISSIONS: Mission[] = [
  { id: 'm1', emoji: '🧹', title: '방 청소하기', completed: false },
  { id: 'm2', emoji: '✏️', title: '숙제 스스로 하기', completed: false },
  { id: 'm3', emoji: '⏰', title: '일찍 일어나기', completed: false },
  { id: 'm4', emoji: '🥦', title: '채소 다 먹기', completed: false },
  { id: 'm5', emoji: '🤝', title: '동생이랑 사이좋게 지내기', completed: false },
  { id: 'm6', emoji: '📚', title: '책 읽기', completed: false },
  { id: 'm7', emoji: '🧼', title: '손 씻기', completed: false },
  { id: 'm8', emoji: '🎹', title: '피아노 연습하기', completed: false },
  { id: 'm9', emoji: '💤', title: '낮잠 안 자기', completed: false },
];

const BG_COLOR = '#FFF9EE';
const BLUE_TEXT = '#4C84FF';
const DOT_ACTIVE = '#E9C784';
const DOT_INACTIVE = '#DFDFDF';

const BOARD_WIDTH = Math.min(SCREEN_WIDTH - 44, 320);
const BOARD_HEIGHT = BOARD_WIDTH * 1.08;
const STICKERS_PER_PAGE = 4;

const GRID_ROWS = 4;
const GRID_COLS = 5;

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
  missions = DEFAULT_MISSIONS,
}: TreeProps) {
  const { activeStickerBoard } = useGrowth();
  const activeBoard = activeStickerBoard;

  const resolvedBoardName = activeBoard?.title ?? boardName;
  const resolvedReward = activeBoard?.rewardText ?? reward;
  const resolvedMissions = activeBoard
    ? activeBoard.missions.map((mission) => ({
        id: mission.id,
        emoji: mission.emoji,
        title: mission.title,
        completed: false,
      }))
    : missions;
  const totalSpots = Number.parseInt(activeBoard?.stickerCount ?? '', 10) || 20;

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
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [infoModal, setInfoModal] = useState<{ visible: boolean; spotId?: number; data?: StickerInfo }>({
    visible: false,
  });

  const boardRef = useRef<View>(null);
  const boardLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const scaleAnims = useRef<Record<number, Animated.Value>>({});
  const placedStickersRef = useRef(placedStickers);
  placedStickersRef.current = placedStickers;

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

  const measureBoard = useCallback(() => {
    boardRef.current?.measureInWindow((x, y, width, height) => {
      boardLayoutRef.current = { x, y, width, height };
    });
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

  const getGridCellFromPoint = useCallback((absoluteX: number, absoluteY: number): number | null => {
    const { x, y, width, height } = boardLayoutRef.current;

    const relativeX = absoluteX - x;
    const relativeY = absoluteY - y;

    if (relativeX < 0 || relativeY < 0 || relativeX > width || relativeY > height) {
      return null;
    }

    const col = Math.floor((relativeX / width) * GRID_COLS);
    const row = Math.floor((relativeY / height) * GRID_ROWS);

    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
      return null;
    }

    const cellId = row * GRID_COLS + col + 1;

    if (placedStickersRef.current[cellId]) return null;

    return cellId;
  }, []);

  const panHandlersMap = useRef<Record<number, ReturnType<typeof PanResponder.create>['panHandlers']>>({});

  const getPanHandlers = useCallback(
    (idx: number) => {
      if (!panHandlersMap.current[idx]) {
        const responder = PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderTerminationRequest: () => false,

          onPanResponderGrant: (evt) => {
            measureBoard();
            setDraggingStickerIdx(idx);
            setDragPos({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
          },

          onPanResponderMove: (evt) => {
            setDragPos({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
          },

          onPanResponderRelease: (evt) => {
            const dropX = evt.nativeEvent.pageX;
            const dropY = evt.nativeEvent.pageY;
            const cellId = getGridCellFromPoint(dropX, dropY);
            const mission = resolvedMissions[idx];

            setDraggingStickerIdx(null);

            if (cellId === null || !mission) return;

            placeSticker(cellId, mission, idx);
            setUsedStickerIndices((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
          },

          onPanResponderTerminate: () => {
            setDraggingStickerIdx(null);
          },
        });

        panHandlersMap.current[idx] = responder.panHandlers;
      }

      return panHandlersMap.current[idx];
    },
    [getGridCellFromPoint, measureBoard, placeSticker, resolvedMissions],
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

  const handleDeleteSticker = () => {
    const spotId = infoModal.spotId;
    if (typeof spotId !== 'number') return;

    const stickerToDelete = placedStickers[spotId];

    setPlacedStickers((prev) => {
      const next = { ...prev };
      delete next[spotId];
      return next;
    });

    if (stickerToDelete) {
      setUsedStickerIndices((prev) => prev.filter((idx) => idx !== stickerToDelete.stickerIdx));
    }

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
          스티커판 완성까지 <Text style={styles.progressHighlight}>{placedCount}/{totalSpots}</Text> 개
        </Text>
        </View>

        <View ref={boardRef} collapsable={false}>
          <StickerGridBoard
            width={BOARD_WIDTH}
            height={BOARD_HEIGHT}
            cells={gridCells}
            placedStickers={placedStickers}
            getScaleAnim={getScaleAnim}
            onCellPress={handleCellPress}
            onLayoutBoard={measureBoard}
          />
        </View>

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
                    <View {...getPanHandlers(idx)} style={styles.draggableArea}>
                      <View style={[styles.stickerCircle, isDraggingThis && { opacity: 0 }]}>
                        <FloatingStickerIcon emoji={resolvedMissions[idx]?.emoji} />
                      </View>
                    </View>
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

        {totalPages > 1 ? (
          <View style={styles.stickerPageDotContainer}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stickerPageDot,
                  index === stickerPage && styles.stickerPageDotActive,
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>

      {draggingStickerIdx !== null && (
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
              placedAtLabel={
                infoModal.data?.placedAt.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) ?? ''
              }
              onDelete={handleDeleteSticker}
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
    marginBottom: 4,
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
  stickerPageDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  stickerPageDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: DOT_INACTIVE,
  },
  stickerPageDotActive: {
    backgroundColor: DOT_ACTIVE,
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
    width: '76%',
  },
});
