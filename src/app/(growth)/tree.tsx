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
  Alert,
  SafeAreaView,
  PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { StickerInfoCard } from '@/components/growth/StickerInfoCard';
import TreeSvg from '../../../assets/tree.svg';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { useGrowth } from '@/contexts/GrowthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Mission {
  id: string;
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
  { id: 'm1', title: '방 청소하기', completed: false },
  { id: 'm2', title: '숙제 스스로 하기', completed: false },
  { id: 'm3', title: '일찍 일어나기', completed: false },
  { id: 'm4', title: '채소 다 먹기', completed: false },
  { id: 'm5', title: '동생이랑 사이좋게 지내기', completed: false },
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
const STICKER_ICON_COLOR = '#FF3B30';
const STICKER_ICON_NAME = 'food-apple';
const STICKER_ICON_SIZE = 36;
const STICKER_ICON_OUTLINE_SIZE = 42;

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

function StickerIcon() {
  return (
    <View style={styles.stickerIconWrap}>
      <View style={styles.iconBackground} />
      <MaterialCommunityIcons
        name={STICKER_ICON_NAME}
        size={29}
        color={STICKER_ICON_COLOR}
      />
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
  const { getBoardById } = useGrowth();
  const activeBoard = getBoardById('board-1');
  const resolvedBoardName = activeBoard?.title ?? boardName;
  const resolvedReward = activeBoard?.rewardText ?? reward;
  const resolvedTotalSpots = Number.parseInt(activeBoard?.stickerCount ?? '', 10) || totalSpots;
  const resolvedMissions = activeBoard
    ? activeBoard.missions.map((mission) => ({
        id: mission.id,
        title: mission.title,
        completed: false,
      }))
    : missions;

  const [placedStickers, setPlacedStickers] = useState<Record<number, StickerInfo>>({});
  const [usedStickerIndices, setUsedStickerIndices] = useState<number[]>([]);
  const [pendingDrop, setPendingDrop] = useState<{ spotId: number; stickerIdx: number } | null>(null);
  const [missionModal, setMissionModal] = useState(false);
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

            setDraggingStickerIdx(null);

            if (spotId === null) return; // 유효 스팟 없음 → 취소

            setPendingDrop({ spotId, stickerIdx: idx });
            setMissionModal(true);
          },

          onPanResponderTerminate: () => {
            setDraggingStickerIdx(null);
          },
        });

        panHandlersMap.current[idx] = responder.panHandlers;
      }
      return panHandlersMap.current[idx];
    },
    [getNearestEmptySpot, measureTree, placeSticker],
  );

  // ── 스팟 터치 ────────────────────────────────────────────────────────────────
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

  // ── 미션 선택 ────────────────────────────────────────────────────────────────
  const handleMissionSelect = (mission: Mission) => {
    if (pendingDrop) {
      placeSticker(pendingDrop.spotId, mission, pendingDrop.stickerIdx);
      setUsedStickerIndices((prev) =>
        prev.includes(pendingDrop.stickerIdx) ? prev : [...prev, pendingDrop.stickerIdx],
      );
      setPendingDrop(null);
    }
    setMissionModal(false);
  };

  // ── 스와이프 (화면 전환) ──────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────────
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

        {/* 트리 영역 */}
        <View style={styles.treeSection}>
          <View
            ref={treeWrapperRef}
            style={styles.treeWrapper}
            onLayout={measureTree} // 레이아웃 확정 시 측정
          >
            <TreeSvg width={TREE_WIDTH} height={TREE_HEIGHT} style={styles.treeSvg} />

            {spots.map((pos, i) => {
              const spotId = i + 1;
              const placed = placedStickers[spotId];
              const scaleAnim = getScaleAnim(spotId);
              const left = pos.x * TREE_WIDTH - SPOT_SIZE / 2;
              const top = pos.y * TREE_HEIGHT - SPOT_SIZE / 2;

              return (
                <TouchableOpacity
                  key={spotId}
                  activeOpacity={0.8}
                  onPress={() => handleSpotPress(spotId)}
                  style={[
                    styles.spot,
                    { left, top, width: SPOT_SIZE, height: SPOT_SIZE, borderRadius: SPOT_SIZE / 2 },
                  ]}
                >
                  {placed ? (
                    <Animated.View
                      style={[
                        styles.placedStickerCircle,
                        { transform: [{ scale: scaleAnim }] },
                      ]}
                    >
                      <StickerIcon />
                    </Animated.View>
                  ) : (
                    <View style={styles.emptySpot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.progressText}>
            성장나무 완성까지{' '}
            <Text style={styles.progressHighlight}>
              {placedCount}/{spots.length}
            </Text>{' '}
            개
          </Text>
        </View>

        {/* 하단 스티커 피커 */}
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
              const isUsed =
                pendingDrop?.stickerIdx === idx ||
                usedStickerIndices.includes(idx);
              const isDraggingThis = draggingStickerIdx === idx;

              return (
                <View key={idx} style={styles.bigStickerOption}>
                  {!isUsed ? (
                    // ✅ 메모이즈된 panHandlers 사용
                    <View {...getPanHandlers(idx)} style={styles.draggableArea}>
                      <View
                        style={[
                          styles.stickerCircle,
                          isDraggingThis && { opacity: 0 },
                        ]}
                      >
                        <StickerIcon />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.usedSlot} />
                  )}
                </View>
              );
            })}

            {/* 빈 칸 채우기 */}
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
        <TouchableOpacity
          style={styles.requestButton}
          onPress={
            onRequestSticker ??
            (() => Alert.alert('스티커 요청!', '부모님께 미션 완료 알림을 보냈어요!'))
          }
          activeOpacity={0.9}
        >
          <Text style={styles.requestButtonText}>스티커 조르기</Text>
        </TouchableOpacity>
      </View>

      {/* 드래그 중 손가락 따라다니는 스티커 */}
      {draggingStickerIdx !== null && (
        <View
          pointerEvents="none"
          style={[
            styles.draggingSticker,
            { left: dragPos.x - 27, top: dragPos.y - 27 },
          ]}
        >
          <StickerIcon />
        </View>
      )}

      {/* 미션 선택 모달 */}
      <Modal visible={missionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>어떤 미션을 완료했나요?</Text>

            {resolvedMissions.map((m) => {
              const isDone = Object.values(placedStickers).some((s) => s.mission.id === m.id);
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.modalMissionItem, isDone && styles.modalMissionDone]}
                  disabled={isDone}
                  onPress={() => handleMissionSelect(m)}
                >
                  <Text style={[styles.modalMissionText, isDone && styles.modalMissionTextDone]}>
                    {isDone ? '(완료) ' : ''}
                    {m.title}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => {
                setPendingDrop(null);
                setMissionModal(false);
              }}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 스티커 상세 정보 모달 */}
      <Modal visible={infoModal.visible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlayCenter}
          onPress={() => setInfoModal({ visible: false })}
        >
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.infoCardWrap}>
            <StickerInfoCard
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
  treeWrapper: {
    width: TREE_WIDTH,
    height: TREE_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeSvg: { position: 'absolute' },

  spot: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  emptySpot: {
    width: SPOT_SIZE,
    height: SPOT_SIZE,
    borderRadius: SPOT_SIZE / 2,
    backgroundColor: EMPTY_SPOT,
  },
  // ✅ 부착된 스티커 색상 → colors.primary[900]
  placedStickerCircle: {
    width: SPOT_SIZE,
    height: SPOT_SIZE,
    borderRadius: SPOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },

  progressText: { marginTop: 8, fontSize: 16, fontFamily: fontFamily?.bold || 'System', color: BLUE_TEXT },
  progressHighlight: { fontFamily: fontFamily?.bold || 'System' },

  stickerPickerWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
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

  // 드래그 중 떠다니는 스티커도 하단 스티커와 같은 색상
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

  // iOS shadow
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 1,
  shadowOffset: { width: 0, height: 1 },

  // Android shadow
  elevation: 1,
},
  stickerIconOutline: {
    position: 'absolute',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  modalMissionItem: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F7F7F7', marginBottom: 8 },
  modalMissionDone: { backgroundColor: '#F1F1F1', opacity: 0.5 },
  modalMissionText: { fontSize: 15, color: '#333' },
  modalMissionTextDone: { color: '#AAA' },
  modalCancelBtn: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
  modalCancelText: { fontSize: 15, color: '#888' },

  infoCardWrap: {
    width: '76%',
  },
});
