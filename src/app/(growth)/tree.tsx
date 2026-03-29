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
  Alert,
  SafeAreaView,
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
  emoji: string;
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

const STICKER_OPTIONS = ['⭐', '🌟', '🎯', '❤️', '🏆', '🍀', '🎨', '🦋'];

const BG_COLOR = '#FFF9EE';
const EMPTY_SPOT = '#D8D8D8';
const BLUE_TEXT = '#4C84FF';
const DOT_ACTIVE = '#E9C784';
const DOT_INACTIVE = '#DFDFDF';

const TREE_WIDTH = Math.min(SCREEN_WIDTH - 44, 320);
const TREE_HEIGHT = TREE_WIDTH * 1.08;
const SPOT_SIZE = 28;
const STICKER_FONT = 18;

// 시안 느낌으로 재배치
const SPOT_LAYOUT: { x: number; y: number }[] = [
  { x: 0.50, y: 0.08 },

  { x: 0.40, y: 0.18 },
  { x: 0.60, y: 0.18 },

  { x: 0.27, y: 0.32 },
  { x: 0.40, y: 0.32 },
  { x: 0.50, y: 0.32 },
  { x: 0.60, y: 0.32 },
  { x: 0.73, y: 0.32 },

  { x: 0.50, y: 0.45 },

  { x: 0.25, y: 0.56 },
  { x: 0.37, y: 0.56 },
  { x: 0.50, y: 0.56 },
  { x: 0.63, y: 0.56 },
  { x: 0.75, y: 0.56 },

  { x: 0.22, y: 0.76 },
  { x: 0.34, y: 0.76 },
  { x: 0.45, y: 0.76 },
  { x: 0.55, y: 0.76 },
  { x: 0.66, y: 0.76 },
  { x: 0.78, y: 0.76 },
];

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
  const [missionModal, setMissionModal] = useState(false);
  const [infoModal, setInfoModal] = useState<{ visible: boolean; data?: StickerInfo }>({
    visible: false,
  });

  const scaleAnims = useRef<Record<number, Animated.Value>>({});

  const getScaleAnim = (id: number) => {
    if (!scaleAnims.current[id]) {
      scaleAnims.current[id] = new Animated.Value(1);
    }
    return scaleAnims.current[id];
  };

  const placedCount = Object.keys(placedStickers).length;
  const spots = SPOT_LAYOUT.slice(0, totalSpots);

  const handleSpotPress = (id: number) => {
    if (placedStickers[id]) {
      setInfoModal({ visible: true, data: placedStickers[id] });
      return;
    }

    if (!selectedEmoji) {
      Alert.alert('스티커를 먼저 선택해주세요!', '아래 원형 스티커 중 하나를 골라주세요 😊');
      return;
    }

    if (!selectedMission) {
      setMissionModal(true);
      return;
    }

    placeSticker(id, selectedEmoji, selectedMission);
  };

  const placeSticker = (spotId: number, emoji: string, mission: Mission) => {
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
          <View style={styles.treeWrapper}>
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
                    {
                      left,
                      top,
                      width: SPOT_SIZE,
                      height: SPOT_SIZE,
                      borderRadius: SPOT_SIZE / 2,
                    },
                  ]}
                >
                  {placed ? (
                    <Animated.Text
                      style={[
                        styles.stickerEmoji,
                        {
                          fontSize: STICKER_FONT,
                          transform: [{ scale: scaleAnim }],
                        },
                      ]}
                    >
                      {placed.emoji}
                    </Animated.Text>
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
              {placedCount}/{totalSpots}
            </Text>{' '}
            개
          </Text>
        </View>

        <View style={styles.stickerPickerWrap}>
          <TouchableOpacity style={styles.arrowBtn}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.stickerPickerInner}>
            {STICKER_OPTIONS.slice(0, 4).map((emoji) => {
              const selected = selectedEmoji === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.bigStickerOption,
                    selected && styles.bigStickerOptionSelected,
                  ]}
                  onPress={() => setSelectedEmoji((prev) => (prev === emoji ? null : emoji))}
                  activeOpacity={0.85}
                >
                  <Text style={styles.bigStickerEmoji}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.arrowBtn}>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pagination}>
          <View style={[styles.pageDot, styles.pageDotActive]} />
          <View style={styles.pageDot} />
          <View style={styles.pageDot} />
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
              onPress={() => setMissionModal(false)}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={infoModal.visible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlayCenter}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    paddingTop: 26,
    paddingBottom: 40,
    paddingHorizontal: 22,
    alignItems: 'center',
  },

  topSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 35,
    fontFamily: fontFamily.bold,
    color: '#1B1B1B',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardLabel: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: BLUE_TEXT,
  },
  rewardValue: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
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
  stickerEmoji: {
    textAlign: 'center',
  },

  progressText: {
    marginTop: 6,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: BLUE_TEXT,
  },
  progressHighlight: {
    fontFamily: fontFamily.bold,
  },

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
  stickerPickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bigStickerOption: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigStickerOptionSelected: {
    borderWidth: 2,
    borderColor: '#C59B4E',
    backgroundColor: '#E6DED0',
  },
  bigStickerEmoji: {
    fontSize: 24,
  },

  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    marginTop: 22,
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
    marginTop: 28,
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
  infoEmoji: {
    fontSize: 54,
    marginBottom: 12,
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
