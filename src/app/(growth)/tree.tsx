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

import { StickerInfoCard } from '@/components/growth/StickerInfoCard';
import { TreeBoard } from '@/components/growth/TreeBoard';
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
  totalSpots?: number;
  missions?: Mission[];
  onRequestSticker?: () => void;
}

const DEFAULT_MISSIONS: Mission[] = [
  { id: 'm1', emoji: '🧹', title: '방 청소하기', completed: false },
  { id: 'm2', emoji: '✏️', title: '숙제 스스로 하기', completed: false },
  { id: 'm3', emoji: '⏰', title: '일찍 일어나기', completed: false },
  { id: 'm4', emoji: '🥦', title: '채소 다 먹기', completed: false },
  { id: 'm5', emoji: '🤝', title: '동생이랑 사이좋게 지내기', completed: false },
];

const BG_COLOR = '#FFF9EE';
const EMPTY_SPOT = '#D8D8D8';
const BLUE_TEXT = '#4C84FF';
const DOT_ACTIVE = '#E9C784';
const DOT_INACTIVE = '#DFDFDF';

const TREE_WIDTH = Math.min(SCREEN_WIDTH - 44, 320);
const TREE_HEIGHT = TREE_WIDTH * 1.08;
const SPOT_SIZE = 28;
const STICKERS_PER_PAGE = 4;
const DROP_RADIUS = 48;

const SPOT_LAYOUT: { x: number; y: number }[] = [
  { x: 0.50, y: 0.08 },
  { x: 0.38, y: 0.21 },
  { x: 0.62, y: 0.21 },
  { x: 0.27, y: 0.35 },
  { x: 0.39, y: 0.35 },
  { x: 0.50, y: 0.35 },
  { x: 0.61, y: 0.35 },
  { x: 0.73, y: 0.35 },
  { x: 0.50, y: 0.45 },
  { x: 0.22, y: 0.55 },
  { x: 0.36, y: 0.55 },
  { x: 0.50, y: 0.55 },
  { x: 0.64, y: 0.55 },
  { x: 0.78, y: 0.55 },
  { x: 0.14, y: 0.76 },
  { x: 0.28, y: 0.76 },
  { x: 0.43, y: 0.76 },
  { x: 0.57, y: 0.76 },
  { x: 0.71, y: 0.76 },
  { x: 0.85, y: 0.76 },
];

function FloatingStickerIcon({ emoji }: { emoji?: string }) {
  return (
    <View style={styles.floatingStickerIconWrap}>
      <View style={styles.floatingStickerBackground} />
      {emoji ? <Text style={styles.floatingStickerEmoji}>{emoji}</Text> : null}
    </View>
  );
}

export default function GrowthTree({
  boardName = '유진이의 성장나무',
  reward = '닌텐도 DS 1시간 사용',
  totalSpots = SPOT_LAYOUT.length,
  missions = DEFAULT_MISSIONS,
  onRequestSticker,
}: TreeProps) {
  const { activeStickerBoard } = useGrowth();
  const activeBoard = activeStickerBoard;
  const resolvedBoardName = activeBoard?.title ?? boardName;
  const resolvedReward = activeBoard?.rewardText ?? reward;
  const resolvedTotalSpots = Number.parseInt(activeBoard?.stickerCount ?? '', 10) || totalSpots;
  const resolvedMissions = activeBoard
    ? activeBoard.missions.map((mission) => ({
        id: mission.id,
        emoji: mission.emoji,
        title: mission.title,
        completed: false,
      }))
    : missions;

  const [placedStickers, setPlacedStickers] = useState<Record<number, StickerInfo>>({});
  const [usedStickerIndices, setUsedStickerIndices] = useState<number[]>([]);
  const [infoModal, setInfoModal] = useState<{ visible: boolean; spotId?: number; data?: StickerInfo }>({
    visible: false,
  });

  const [stickerPage, setStickerPage] = useState(0);
  const [draggingStickerIdx, setDraggingStickerIdx] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  const treeWrapperRef = useRef<View>(null);
  const treeLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
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
  const spots = SPOT_LAYOUT.slice(0, resolvedTotalSpots);

  const totalPages = Math.ceil(spots.length / STICKERS_PER_PAGE);
  const pagedIndices = Array.from({ length: spots.length })
    .map((_, i) => i)
    .slice(stickerPage * STICKERS_PER_PAGE, stickerPage * STICKERS_PER_PAGE + STICKERS_PER_PAGE);

  const placeSticker = useCallback((spotId: number, mission: Mission, stickerIdx: number) => {
    const anim = getScaleAnim(spotId);
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      friction: 5,
      tension: 160,
      useNativeDriver: true,
    }).start();

    setPlacedStickers((prev) => ({
      ...prev,
      [spotId]: { placedAt: new Date(), mission, stickerIdx },
    }));
  }, []);

  const measureTree = useCallback(() => {
    treeWrapperRef.current?.measureInWindow((x, y, width, height) => {
      treeLayoutRef.current = { x, y, width, height };
    });
  }, []);

  const getNearestEmptySpot = useCallback(
    (absoluteX: number, absoluteY: number): number | null => {
      const { x: treeX, y: treeY, width: treeWidth, height: treeHeight } = treeLayoutRef.current;
      let nearestId: number | null = null;
      let nearestDist = Infinity;

      spots.forEach((pos, i) => {
        const spotId = i + 1;
        if (placedStickersRef.current[spotId]) return;

        const cx = treeX + pos.x * treeWidth;
        const cy = treeY + pos.y * treeHeight;
        const dist = Math.hypot(absoluteX - cx, absoluteY - cy);

        if (dist < nearestDist) {
          nearestDist = dist;
          nearestId = spotId;
        }
      });

      return nearestDist <= DROP_RADIUS ? nearestId : null;
    },
    [spots],
  );

  const panHandlersMap = useRef<Record<number, ReturnType<typeof PanResponder.create>['panHandlers']>>({});

  const getPanHandlers = useCallback(
    (idx: number) => {
      if (!panHandlersMap.current[idx]) {
        const responder = PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderTerminationRequest: () => false,

          onPanResponderGrant: (evt) => {
            measureTree();
            setDraggingStickerIdx(idx);
            setDragPos({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
          },

          onPanResponderMove: (evt) => {
            setDragPos({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
          },

          onPanResponderRelease: (evt) => {
            const dropX = evt.nativeEvent.pageX;
            const dropY = evt.nativeEvent.pageY;
            const spotId = getNearestEmptySpot(dropX, dropY);
            const mission = resolvedMissions[idx];

            setDraggingStickerIdx(null);

            if (spotId === null || !mission) return;

            placeSticker(spotId, mission, idx);
            setUsedStickerIndices((prev) =>
              prev.includes(idx) ? prev : [...prev, idx],
            );
          },

          onPanResponderTerminate: () => {
            setDraggingStickerIdx(null);
          },
        });

        panHandlersMap.current[idx] = responder.panHandlers;
      }
      return panHandlersMap.current[idx];
    },
    [getNearestEmptySpot, measureTree, placeSticker, resolvedMissions],
  );

  const handleSpotPress = (id: number) => {
    if (placedStickers[id]) {
      setInfoModal({ visible: true, spotId: id, data: placedStickers[id] });
    }
  };

  const handleDeleteSticker = () => {
    const spotId = infoModal.spotId;

    if (typeof spotId !== 'number') {
      return;
    }

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
        {/* 상단 */}
        <View style={styles.topSection}>
          <Text style={styles.title}>{resolvedBoardName}</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>보상 :</Text>
            <Text style={styles.rewardValue}>{resolvedReward}</Text>
          </View>
        </View>

        <View style={styles.treeSection}>
          <TreeBoard
            ref={treeWrapperRef}
            width={TREE_WIDTH}
            height={TREE_HEIGHT}
            spotSize={SPOT_SIZE}
            spots={spots}
            placedStickers={placedStickers}
            getScaleAnim={getScaleAnim}
            onSpotPress={handleSpotPress}
            onLayout={measureTree}
          />

          <Text style={styles.progressText}>
            성장나무 완성까지{' '}
            <Text style={styles.progressHighlight}>
              {placedCount}/{spots.length}
            </Text>{' '}
            개
          </Text>
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
                      <View
                        style={[
                          styles.stickerCircle,
                          isDraggingThis && { opacity: 0 },
                        ]}
                      >
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
            <Text
              style={[styles.arrowText, stickerPage === totalPages - 1 && styles.arrowDisabled]}
            >
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

        {/* 스티커 조르기 버튼 */}
        {/* <TouchableOpacity
          style={styles.requestButton}
          onPress={
            onRequestSticker ??
            (() => Alert.alert('스티커 요청!', '부모님께 미션 완료 알림을 보냈어요!'))
          }
          activeOpacity={0.9}
        >
          <Text style={styles.requestButtonText}>스티커 조르기</Text>
        </TouchableOpacity> */}
      </View>

      {draggingStickerIdx !== null && (
        <View
          pointerEvents="none"
          style={[
            styles.draggingSticker,
            { left: dragPos.x - 27, top: dragPos.y - 27 },
          ]}
        >
          <FloatingStickerIcon emoji={resolvedMissions[draggingStickerIdx]?.emoji} />
        </View>
      )}

      {/* 스티커 상세 정보 모달 */}
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
  container: { flex: 1, backgroundColor: BG_COLOR },
  content: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 22,
    alignItems: 'center',
    flex: 1,
  },

  topSection: { alignItems: 'center', marginBottom: 14 },
  title: {
    fontSize: 35,
    fontFamily: fontFamily?.bold || 'System',
    color: '#1B1B1B',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardLabel: { fontSize: 16, fontFamily: fontFamily?.bold || 'System', color: BLUE_TEXT },
  rewardValue: { fontSize: 16, fontFamily: fontFamily?.bold || 'System', color: BLUE_TEXT },

  treeSection: { alignItems: 'center', marginTop: 4 },

  progressText: { marginTop: 8, fontSize: 16, fontFamily: fontFamily?.bold || 'System', color: BLUE_TEXT },
  progressHighlight: { fontFamily: fontFamily?.bold || 'System' },

  stickerPickerWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
  arrowBtn: { width: 24, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 28, color: '#111', fontWeight: '400' },
  arrowDisabled: { color: '#CFCFCF' },
  stickerPickerInner: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 54 },
  bigStickerOption: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  draggableArea: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  stickerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  floatingStickerIconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingStickerBackground: {
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
  floatingStickerEmoji: {
    fontSize: 22,
    lineHeight: 24,
  },
  usedSlot: {
    width: 42,
    height: 42,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E6D3',
  },

  requestButton: {
    marginTop: 44,
    backgroundColor: '#E7DDCD',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#D7C9B2',
  },
  requestButtonText: { fontSize: 17, fontFamily: fontFamily.bold, color: '#6C523C' },

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
