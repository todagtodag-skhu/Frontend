import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
  Alert,
  SafeAreaView,
  PanResponder,
  ScrollView,
} from 'react-native';

import TreeSvg from '../../../assets/tree.svg';
import { fontFamily } from '@/constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Mission {
  id: string;
  title: string;
  completed: boolean;
}

interface StickerInfo {
  placedAt: Date;
  mission: Mission;
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

// 기존 색상 유지
const BG_COLOR = '#FFF9EE';
const EMPTY_SPOT = '#D8D8D8';
const BLUE_TEXT = '#4C84FF';
const DOT_ACTIVE = '#E9C784';   // 스티커(동그라미) 기본 색상으로 사용
const DOT_INACTIVE = '#DFDFDF'; // 스티커 쓴 후 빈자리 색상으로 사용

const TREE_WIDTH = Math.min(SCREEN_WIDTH - 44, 320);
const TREE_HEIGHT = TREE_WIDTH * 1.08;
const SPOT_SIZE = 28;
const STICKERS_PER_PAGE = 4;

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
  { x: 0.22, y: 0.56 },
  { x: 0.36, y: 0.56 },
  { x: 0.50, y: 0.56 },
  { x: 0.64, y: 0.56 },
  { x: 0.78, y: 0.56 },
  { x: 0.14, y: 0.77 },
  { x: 0.28, y: 0.77 },
  { x: 0.43, y: 0.77 },
  { x: 0.57, y: 0.77 },
  { x: 0.71, y: 0.77 },
  { x: 0.85, y: 0.77 },
];

export default function GrowthTree({
  boardName = '유진이의 성장나무',
  reward = '닌텐도 DS 1시간 사용',
  totalSpots = SPOT_LAYOUT.length,
  missions = DEFAULT_MISSIONS,
  onRequestSticker,
}: TreeProps) {
  const [placedStickers, setPlacedStickers] = useState<Record<number, StickerInfo>>({});
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [pendingDrop, setPendingDrop] = useState<{ spotId: number } | null>(null);
  const [missionModal, setMissionModal] = useState(false);
  const [infoModal, setInfoModal] = useState<{ visible: boolean; data?: StickerInfo }>({
    visible: false,
  });

  const [stickerPage, setStickerPage] = useState(0);
  const [draggingStickerIdx, setDraggingStickerIdx] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  const treeWrapperRef = useRef<View>(null);
  const treeLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const scaleAnims = useRef<Record<number, Animated.Value>>({});

  const getScaleAnim = (id: number) => {
    if (!scaleAnims.current[id]) {
      scaleAnims.current[id] = new Animated.Value(1);
    }
    return scaleAnims.current[id];
  };

  const placedCount = Object.keys(placedStickers).length;
  const spots = SPOT_LAYOUT.slice(0, totalSpots);

  // 페이지네이션 계산 로직
  const totalPages = Math.ceil(spots.length / STICKERS_PER_PAGE);
  const pagedIndices = Array.from({ length: spots.length })
    .map((_, i) => i)
    .slice(stickerPage * STICKERS_PER_PAGE, stickerPage * STICKERS_PER_PAGE + STICKERS_PER_PAGE);

  const placeSticker = (spotId: number, mission: Mission) => {
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
      [spotId]: {
        placedAt: new Date(),
        mission,
      },
    }));
  };

  const handleSpotPress = (id: number) => {
    if (placedStickers[id]) {
      setInfoModal({ visible: true, data: placedStickers[id] });
    }
  };

  const handleMissionSelect = (mission: Mission) => {
    setSelectedMission(mission);

    if (pendingDrop) {
      placeSticker(pendingDrop.spotId, mission);
      setPendingDrop(null);
    }

    setMissionModal(false);
  };

  const getNearestEmptySpot = (absoluteX: number, absoluteY: number) => {
    const { x: treeX, y: treeY } = treeLayoutRef.current;

    let nearestSpotId: number | null = null;
    let nearestDistance = Infinity;

    spots.forEach((pos, i) => {
      const spotId = i + 1;
      if (placedStickers[spotId]) return;

      const spotCenterX = treeX + pos.x * TREE_WIDTH;
      const spotCenterY = treeY + pos.y * TREE_HEIGHT;

      const dx = absoluteX - spotCenterX;
      const dy = absoluteY - spotCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestSpotId = spotId;
      }
    });

    if (nearestDistance <= 38) {
      return nearestSpotId;
    }

    return null;
  };

  const startDrag = (idx: number) => {
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setDraggingStickerIdx(idx);
        setDragPos({
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        });
      },
      onPanResponderMove: (evt) => {
        setDragPos({
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        });
      },
      onPanResponderRelease: (evt) => {
        const dropX = evt.nativeEvent.pageX;
        const dropY = evt.nativeEvent.pageY;
        const spotId = getNearestEmptySpot(dropX, dropY);

        if (spotId === null) {
          setDraggingStickerIdx(null);
          return;
        }

        if (selectedMission) {
          placeSticker(spotId, selectedMission);
        } else {
          setPendingDrop({ spotId });
          setMissionModal(true);
        }

        setDraggingStickerIdx(null);
      },
      onPanResponderTerminate: () => {
        setDraggingStickerIdx(null);
      },
    });

    return responder.panHandlers;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topSection}>
          <Text style={styles.title}>{boardName}</Text>

          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>보상 :</Text>
            <Text style={styles.rewardValue}>{reward}</Text>
          </View>
        </View>

        <View style={styles.treeSection}>
          <View
            ref={treeWrapperRef}
            style={styles.treeWrapper}
            onLayout={() => {
              treeWrapperRef.current?.measureInWindow((x, y, width, height) => {
                treeLayoutRef.current = { x, y, width, height };
              });
            }}
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
                    />
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

        {/* 하단 화살표 + 스티커 4개씩 보여주는 영역 */}
        <View style={styles.stickerPickerWrap}>
          <TouchableOpacity
            style={styles.arrowBtn}
            disabled={stickerPage === 0}
            onPress={() => setStickerPage((prev) => Math.max(prev - 1, 0))}
          >
            <Text style={[styles.arrowText, stickerPage === 0 && styles.arrowDisabled]}>‹</Text>
          </TouchableOpacity>

          <View style={styles.stickerPickerInner}>
            {pagedIndices.map((idx) => {
              const isUsed = idx < placedCount; // 스티커를 사용했는지 여부
              const isDraggingThis = draggingStickerIdx === idx;

              return (
                <View key={idx} style={styles.bigStickerOption}>
                  {!isUsed ? (
                    <View {...startDrag(idx)} style={styles.draggableArea}>
                      <View
                        style={[
                          styles.stickerCircle,
                          isDraggingThis && { opacity: 0 },
                        ]}
                      />
                    </View>
                  ) : (
                    <View style={styles.usedSlot} />
                  )}
                </View>
              );
            })}
            
            {/* 남는 칸이 있을 경우 공간 유지를 위해 더미 렌더링 */}
            {Array.from({ length: STICKERS_PER_PAGE - pagedIndices.length }).map((_, i) => (
              <View key={`dummy-${i}`} style={styles.bigStickerOption} />
            ))}
          </View>

          <TouchableOpacity
            style={styles.arrowBtn}
            disabled={stickerPage === totalPages - 1}
            onPress={() => setStickerPage((prev) => Math.min(prev + 1, totalPages - 1))}
          >
            <Text
              style={[
                styles.arrowText,
                stickerPage === totalPages - 1 && styles.arrowDisabled,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* 기존에 있던 페이지 네비게이션 점(Dot) */}
        <View style={styles.pagination}>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <View
              key={idx}
              style={[styles.pageDot, idx === stickerPage && styles.pageDotActive]}
            />
          ))}
        </View>

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
      </ScrollView>

      {/* 손가락을 따라다니는 스티커 (드래그 중일 때만 표시) */}
      {draggingStickerIdx !== null && (
        <View
          pointerEvents="none"
          style={[
            styles.draggingSticker,
            {
              left: dragPos.x - 23, // 드래그 할 때 스티커 크기(46)의 절반
              top: dragPos.y - 23,
            },
          ]}
        />
      )}

      {/* 미션 선택 모달 */}
      <Modal visible={missionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>어떤 미션을 완료했나요?</Text>

            {missions.map((m) => {
              const isDone = Object.values(placedStickers).some((s) => s.mission.id === m.id);

              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.modalMissionItem, isDone && styles.modalMissionDone]}
                  disabled={isDone}
                  onPress={() => handleMissionSelect(m)}
                >
                  <Text style={[styles.modalMissionText, isDone && styles.modalMissionTextDone]}>
                    {isDone ? '(완료됨) ' : ''}
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
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlayCenter}
          onPress={() => setInfoModal({ visible: false })}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoCirclePreview} />
            <Text style={styles.infoMission}>📌 {infoModal.data?.mission.title}</Text>
            <Text style={styles.infoDate}>
              {infoModal.data?.placedAt.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.infoClose}>탭해서 닫기</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 22,
    alignItems: 'center',
  },

  topSection: {
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 35,
    fontFamily: fontFamily?.bold || 'System',
    color: '#1B1B1B',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

  treeSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  treeWrapper: {
    width: TREE_WIDTH,
    height: TREE_HEIGHT,
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
    width: SPOT_SIZE,
    height: SPOT_SIZE,
    borderRadius: SPOT_SIZE / 2,
    backgroundColor: EMPTY_SPOT,
  },
  placedStickerCircle: {
    width: SPOT_SIZE,
    height: SPOT_SIZE,
    borderRadius: SPOT_SIZE / 2,
    backgroundColor: DOT_ACTIVE,
  },

  progressText: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: fontFamily?.bold || 'System',
    color: BLUE_TEXT,
  },
  progressHighlight: {
    fontFamily: fontFamily?.bold || 'System',
  },

  // 하단 스티커 픽커 (화살표 포함)
  stickerPickerWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
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
    gap: 14,
    minHeight: 46,
  },
  bigStickerOption: {
    width: 46,
    height: 46,
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: DOT_ACTIVE, // 기존 이모지 배경으로 쓰던 둥근 회색을 스티커 색으로 변경
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  usedSlot: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: DOT_INACTIVE, // 사용한 자리는 연한 회색으로 표시
  },

  // 페이지 점(Dot)
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    marginTop: 26,
  },
  pageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DOT_INACTIVE,
  },
  pageDotActive: {
    backgroundColor: DOT_ACTIVE,
  },

  requestButton: {
    marginTop: 32,
    backgroundColor: '#E7DDCD',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D7C9B2',
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6C523C',
  },

  // 드래그 중인 스티커 스타일
  draggingSticker: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: DOT_ACTIVE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 999,
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMissionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
    marginBottom: 8,
  },
  modalMissionDone: {
    backgroundColor: '#F1F1F1',
    opacity: 0.5,
  },
  modalMissionText: {
    fontSize: 15,
    color: '#333',
  },
  modalMissionTextDone: {
    color: '#AAA',
  },
  modalCancelBtn: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    color: '#888',
  },

  infoCard: {
    width: SCREEN_WIDTH * 0.76,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
  },
  infoCirclePreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: DOT_ACTIVE,
    marginBottom: 16,
  },
  infoMission: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  infoDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 14,
  },
  infoClose: {
    fontSize: 12,
    color: '#AAA',
  },
});