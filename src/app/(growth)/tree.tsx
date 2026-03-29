import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
  FlatList,
  Alert,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mission {
  id: string;
  title: string;
  completed: boolean;
}

interface StickerInfo {
  emoji: string;
  placedAt: Date;
  mission: Mission;
}

interface StickerSpot {
  id: number;
  row: number;
  col: number;
}

interface TreeProps {
  boardName?: string;          // e.g. "유진이의 성장나무"
  reward?: string;             // e.g. "닌텐도 DS 1시간 사용"
  totalSpots?: number;         // default 20
  missions?: Mission[];
  onRequestSticker?: () => void; // 스티커 조르기 버튼 콜백
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TREE_WIDTH = SCREEN_WIDTH - 48;
const SPOT_SIZE = Math.floor(TREE_WIDTH / 8);          // ~42px
const STICKER_FONT = SPOT_SIZE * 0.55;

// 20개 스팟: 5층 삼각형 (1+2+3+4+5=15) + 하단 5개 = 20
// x,y: 0~1 비율 (트리 영역 기준)
const SPOT_LAYOUT: { x: number; y: number }[] = [
  // Row 0 – 1개 (꼭대기)
  { x: 0.50, y: 0.08 },
  // Row 1 – 2개
  { x: 0.37, y: 0.21 },
  { x: 0.63, y: 0.21 },
  // Row 2 – 3개
  { x: 0.26, y: 0.34 },
  { x: 0.50, y: 0.34 },
  { x: 0.74, y: 0.34 },
  // Row 3 – 4개
  { x: 0.17, y: 0.48 },
  { x: 0.37, y: 0.48 },
  { x: 0.63, y: 0.48 },
  { x: 0.83, y: 0.48 },
  // Row 4 – 5개
  { x: 0.10, y: 0.62 },
  { x: 0.28, y: 0.62 },
  { x: 0.50, y: 0.62 },
  { x: 0.72, y: 0.62 },
  { x: 0.90, y: 0.62 },
  // Row 5 – 5개 (하단)
  { x: 0.17, y: 0.76 },
  { x: 0.31, y: 0.76 },
  { x: 0.50, y: 0.76 },
  { x: 0.69, y: 0.76 },
  { x: 0.83, y: 0.76 },
];

const DEFAULT_MISSIONS: Mission[] = [
  { id: 'm1', title: '방 청소하기', completed: false },
  { id: 'm2', title: '숙제 스스로 하기', completed: false },
  { id: 'm3', title: '일찍 일어나기', completed: false },
  { id: 'm4', title: '채소 다 먹기', completed: false },
  { id: 'm5', title: '동생이랑 사이좋게 지내기', completed: false },
];

const STICKER_OPTIONS = ['⭐', '🌟', '🎯', '❤️', '🏆', '🌈', '🍀', '🦋', '🎪', '🎨'];

const TREE_GREEN_DARK = '#2D7A3A';
const TREE_GREEN_MID = '#3A9B4A';
const TREE_GREEN_LIGHT = '#4BBB5E';
const TRUNK_COLOR = '#7B4F2E';
const BG_COLOR = '#F5F0E8';
const SPOT_EMPTY = 'rgba(180, 175, 165, 0.55)';

// ─── Component ────────────────────────────────────────────────────────────────

export default function GrowthTree({
  boardName = '유진이의 성장나무',
  reward = '닌텐도 DS 1시간 사용',
  totalSpots = 20,
  missions = DEFAULT_MISSIONS,
  onRequestSticker,
}: TreeProps) {
  const [placedStickers, setPlacedStickers] = useState<Record<number, StickerInfo>>({});
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [infoModal, setInfoModal] = useState<{ visible: boolean; data?: StickerInfo }>({
    visible: false,
  });
  const [missionModal, setMissionModal] = useState(false);

  const scaleAnims = useRef<Record<number, Animated.Value>>({});
  const getScaleAnim = (id: number) => {
    if (!scaleAnims.current[id]) {
      scaleAnims.current[id] = new Animated.Value(1);
    }
    return scaleAnims.current[id];
  };

  const placedCount = Object.keys(placedStickers).length;
  const spots = SPOT_LAYOUT.slice(0, totalSpots);

  // 트리 영역 높이 (트리 삼각형 + 기둥)
  const TREE_AREA_HEIGHT = TREE_WIDTH * 0.92;
  const TRUNK_H = TREE_AREA_HEIGHT * 0.12;
  const CANOPY_H = TREE_AREA_HEIGHT - TRUNK_H;

  // 스팟 클릭
  const handleSpotPress = (id: number) => {
    if (placedStickers[id]) {
      // 이미 붙인 스티커 → 정보 조회
      setInfoModal({ visible: true, data: placedStickers[id] });
      return;
    }

    if (!selectedEmoji) {
      Alert.alert('스티커를 먼저 선택해주세요!', '아래에서 붙일 스티커를 선택하세요 😊');
      return;
    }
    if (!selectedMission) {
      setMissionModal(true);
      return;
    }

    placeSticker(id, selectedEmoji, selectedMission);
  };

  const placeSticker = (spotId: number, emoji: string, mission: Mission) => {
    // 붙이기 애니메이션
    const anim = getScaleAnim(spotId);
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      friction: 4,
      tension: 180,
      useNativeDriver: true,
    }).start();

    setPlacedStickers((prev) => ({
      ...prev,
      [spotId]: {
        emoji,
        placedAt: new Date(),
        mission,
      },
    }));
    setSelectedMission(null);
  };

  const handleMissionSelect = (mission: Mission) => {
    setSelectedMission(mission);
    setMissionModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <Text style={styles.boardName}>{boardName}</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>보상 :</Text>
            <Text style={styles.rewardValue}>{reward}</Text>
          </View>
        </View>

        {/* ── 트리 영역 ── */}
        <View style={[styles.treeWrapper, { height: TREE_AREA_HEIGHT }]}>

          {/* 삼각형 레이어 3개 (크리스마스 트리 느낌) */}
          <TreeCanopy width={TREE_WIDTH} height={CANOPY_H} />

          {/* 기둥 */}
          <View
            style={[
              styles.trunk,
              {
                width: TREE_WIDTH * 0.12,
                height: TRUNK_H,
                bottom: 0,
                left: TREE_WIDTH * 0.44,
                backgroundColor: TRUNK_COLOR,
                borderRadius: 4,
              },
            ]}
          />

          {/* 스티커 스팟 */}
          {spots.map((pos, i) => {
            const spotId = i + 1;
            const placed = placedStickers[spotId];
            const scaleAnim = getScaleAnim(spotId);
            const left = pos.x * TREE_WIDTH - SPOT_SIZE / 2;
            const top = pos.y * CANOPY_H - SPOT_SIZE / 2;

            return (
              <TouchableOpacity
                key={spotId}
                activeOpacity={0.7}
                onPress={() => handleSpotPress(spotId)}
                style={[
                  styles.spot,
                  {
                    left,
                    top,
                    width: SPOT_SIZE,
                    height: SPOT_SIZE,
                    borderRadius: SPOT_SIZE / 2,
                    backgroundColor: placed ? 'transparent' : SPOT_EMPTY,
                  },
                ]}
              >
                {placed && (
                  <Animated.Text
                    style={[styles.stickerEmoji, { fontSize: STICKER_FONT, transform: [{ scale: scaleAnim }] }]}
                  >
                    {placed.emoji}
                  </Animated.Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 진행 카운트 ── */}
        <Text style={styles.countText}>
          성장나무 완성까지{' '}
          <Text style={styles.countHighlight}>
            {placedCount}/{totalSpots}
          </Text>{' '}
          개
        </Text>

        {/* ── 스티커 선택 ── */}
        <View style={styles.stickerPickerSection}>
          <Text style={styles.sectionLabel}>스티커 선택</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stickerRow}
          >
            {STICKER_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.stickerOption,
                  selectedEmoji === emoji && styles.stickerOptionSelected,
                ]}
                onPress={() => setSelectedEmoji((prev) => (prev === emoji ? null : emoji))}
              >
                <Text style={styles.stickerOptionText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── 스티커 조르기 버튼 ── */}
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={onRequestSticker ?? (() => Alert.alert('스티커 요청!', '부모님께 미션 완료 알림을 보냈어요!'))}
          activeOpacity={0.85}
        >
          <Text style={styles.requestBtnText}>🎁 스티커 조르기</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── 미션 선택 모달 ── */}
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
                    {isDone ? '(완료됨) ' : ''}{m.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setMissionModal(false)}>
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── 스티커 정보 모달 ── */}
      <Modal visible={infoModal.visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setInfoModal({ visible: false })}
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>{infoModal.data?.emoji}</Text>
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
    </View>
  );
}

// ─── Tree Canopy (삼각형 3층) ────────────────────────────────────────────────

function TreeCanopy({ width, height }: { width: number; height: number }) {
  // 3개의 삼각형을 겹쳐서 크리스마스 트리 실루엣 만들기
  const layers = [
    { widthRatio: 0.60, topRatio: 0.00, color: TREE_GREEN_LIGHT },
    { widthRatio: 0.76, topRatio: 0.22, color: TREE_GREEN_MID },
    { widthRatio: 1.00, topRatio: 0.46, color: TREE_GREEN_DARK },
  ];

  return (
    <View style={{ width, height, position: 'absolute', top: 0, left: 0 }}>
      {layers.map((layer, i) => {
        const tw = width * layer.widthRatio;
        const th = height * (1 - layer.topRatio);
        const top = height * layer.topRatio;
        const left = (width - tw) / 2;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              top,
              left,
              width: 0,
              height: 0,
              borderLeftWidth: tw / 2,
              borderRightWidth: tw / 2,
              borderBottomWidth: th,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: layer.color,
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  boardName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  rewardRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  rewardLabel: {
    fontSize: 13,
    color: '#888',
  },
  rewardValue: {
    fontSize: 13,
    color: '#3A9B4A',
    fontWeight: '600',
  },

  // 트리
  treeWrapper: {
    width: TREE_WIDTH,
    position: 'relative',
    marginBottom: 12,
  },
  trunk: {
    position: 'absolute',
  },
  spot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  stickerEmoji: {
    textAlign: 'center',
  },

  // 카운트
  countText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    marginTop: 4,
  },
  countHighlight: {
    color: '#3A9B4A',
    fontWeight: '700',
  },

  // 스티커 선택
  stickerPickerSection: {
    width: '100%',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  stickerRow: {
    paddingVertical: 4,
    gap: 10,
    paddingHorizontal: 2,
  },
  stickerOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stickerOptionSelected: {
    borderColor: '#3A9B4A',
    backgroundColor: '#E6F6EA',
  },
  stickerOptionText: {
    fontSize: 26,
  },

  // 미션 목록
  missionSection: {
    width: '100%',
    marginBottom: 20,
  },
  missionItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  missionItemDone: {
    backgroundColor: '#F0FAF2',
    borderColor: '#BDE8C5',
  },
  missionText: {
    fontSize: 14,
    color: '#333',
  },
  missionTextDone: {
    color: '#999',
    textDecorationLine: 'line-through',
  },

  // 조르기 버튼
  requestBtn: {
    width: '100%',
    backgroundColor: '#3A9B4A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3A9B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  requestBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },

  // 미션 선택 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
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
    backgroundColor: '#F0F0F0',
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

  // 스티커 정보 모달
  infoCard: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  infoEmoji: {
    fontSize: 56,
    marginBottom: 14,
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
    marginBottom: 16,
  },
  infoClose: {
    fontSize: 12,
    color: '#BBB',
  },
});