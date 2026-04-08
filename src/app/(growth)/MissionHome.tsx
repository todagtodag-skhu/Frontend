import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  View,
  Text,
  ScrollView,
  StyleSheet,
  PanResponder,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import MissionCard from '@/components/growth/Missionlist';
import { StickerRequestButton } from '@/components/growth/StickerRequestButton';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Mission } from '@/components/todagi/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGrowthStickerBoard, requestMissionSticker, type GrowthStickerBoard } from '@/features/growth/api';

const PROGRESS_TOTAL = 20;

const MissionListScreen: React.FC = () => {
  const [board, setBoard] = useState<GrowthStickerBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [showSelectMissionNotice, setShowSelectMissionNotice] = useState(false);
  const [showRequestCompleteNotice, setShowRequestCompleteNotice] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadBoard = async () => {
      try {
        setIsLoading(true);
        const nextBoard = await getGrowthStickerBoard();

        if (cancelled) {
          return;
        }

        setBoard(nextBoard);
        setSelectedMissionId((prev) =>
          prev && nextBoard.missions.some((mission) => mission.id === prev) ? prev : null,
        );
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : '미션 목록을 불러오지 못했습니다.';
          Alert.alert('불러오기 실패', message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBoard();

    return () => {
      cancelled = true;
    };
  }, []);

  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 24 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx <= -60) {
            router.push('/MemoryStorage');
            return;
          }

          if (gestureState.dx >= 60) {
            router.push('/tree');
          }
        },
      }),
    [],
  );

  const handleManageOpen = (mission: Mission) => {
    setSelectedMission(mission);
  };

  const handleManageClose = () => {
    setSelectedMission(null);
  };

  const handleMissionPress = (missionId: string) => {
    setSelectedMissionId((prev) => (prev === missionId ? null : missionId));
  };

  const handleStickerRequestConfirm = () => {
    if (!selectedMissionId) {
      setSelectedMission(null);
      setShowSelectMissionNotice(true);
      return;
    }

    void (async () => {
      try {
        setIsRequesting(true);
        await requestMissionSticker(selectedMissionId);
        setSelectedMission(null);
        setShowRequestCompleteNotice(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '스티커 요청에 실패했습니다.';
        Alert.alert('요청 실패', message);
      } finally {
        setIsRequesting(false);
      }
    })();
  };

  const handleRequestStickerPress = () => {
    if (!board?.missions.length) {
      return;
    }

    if (!selectedMissionId) {
      setShowSelectMissionNotice(true);
      return;
    }

    const missionToOpen =
      board.missions.find((mission) => mission.id === selectedMissionId) ?? board.missions[0];

    setSelectedMission(missionToOpen);
  };

  const hasMissions = Boolean(board?.missions.length);
  const progressTotal = board?.totalSpots || PROGRESS_TOTAL;
  const placedCount = board?.placedStickers.length ?? 0;

  return (
    <SafeAreaView style={styles.safe} {...swipeResponder.panHandlers}>
      <View style={styles.container}>
        <Text style={styles.header}>
          {board ? `${board.title} 미션 목록` : '유진이의 미션 목록'}
        </Text>

        <Text style={styles.headerGuide}>
          아래 미션을 하고, 칭찬 스티커를 열심히 모아요!
        </Text>

        <Text style={styles.progressText}>
          완성까지 {placedCount}/{progressTotal} 개
        </Text>

        <View style={styles.page}>
          {isLoading ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>미션 목록을 불러오는 중이에요.</Text>
            </View>
          ) : hasMissions ? (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.missionList}
              >
                {board?.missions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    emoji={mission.emoji}
                    title={mission.title}
                    frequency={mission.frequency}
                    reward={board.rewardText || '스티커 1개'}
                    isSelected={selectedMissionId === mission.id}
                    onPress={() => handleMissionPress(mission.id)}
                    onManagePress={() => handleManageOpen(mission)}
                  />
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.requestButton}
                onPress={handleRequestStickerPress}
                disabled={isRequesting}
                activeOpacity={0.85}
              >
                <Text style={styles.requestButtonText}>
                  {isRequesting ? '요청 중...' : '스티커 주세요'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>진행중인 미션이 없어요.</Text>
              <Text style={styles.emptyStateBody}>
                토닥이 에게 "미션 만들어주세요"{'\n'}이야기 해보는건 어떨까요?
              </Text>
            </View>
          )}
        </View>

      </View>

      <Modal visible={selectedMission !== null} transparent animationType="fade">
        <Pressable style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleManageClose} />
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalContent}>
            {selectedMission ? (
              <StickerRequestButton
                missionTitle={selectedMission.title}
                onConfirm={handleStickerRequestConfirm}
                onCancel={handleManageClose}
              />
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showSelectMissionNotice} transparent animationType="fade">
        <Pressable style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowSelectMissionNotice(false)} />
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              먼저 완료한 미션을 선택하고 {'\n'}스티커를 요청해 주세요!
            </Text>

            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => setShowSelectMissionNotice(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmButtonText}>네</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showRequestCompleteNotice} transparent animationType="fade">
        <Pressable style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowRequestCompleteNotice(false)} />
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              요청 완료!{'\n'}부모님께 스티커 요청을 보냈어요.
            </Text>

            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => setShowRequestCompleteNotice(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmButtonText}>네</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default MissionListScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF9EE',
  },
  container: {
    flex: 1,
  },
  header: {
    fontSize: 30,
    fontFamily: fontFamily.bold,
    color: '#1A1A1A',
    textAlign: 'center',
    paddingTop: 36,
    paddingBottom: 12,
  },
  headerGuide: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    color: '#5C8DFF',
    fontFamily: fontFamily.bold,
    marginBottom: 2,
  },
  page: {
    paddingHorizontal: 20,
    flex: 1,
    paddingTop: 28,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[900],
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderColor: colors.grayscale[300],
    borderWidth: 1,
  },
  heroEmoji: {
    marginHorizontal: 2,
  },
  missionList: {
    paddingBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.grayscale[600],
    marginTop: 24,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#3578FF',
    marginTop: 0,
    marginBottom: 0,
  },
  progressHighlight: {
    color: '#4DA8E0',
    fontFamily: fontFamily.bold,
  },
  requestButton: {
    alignSelf: 'center',
    backgroundColor: '#E7DDCD',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#D7C9B2',
    marginBottom: 42,
  },
  requestButtonText: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: '#6C523C',
  },
  emptyStateCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: '#1F1A17',
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyStateBody: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1F1A17',
    fontFamily: fontFamily.bold,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    padding: 24,
    paddingTop: 40,
    width: '80%',
    gap: 8,
  },
  modalDescription: {
    fontSize: 18,
    color: colors.grayscale[700],
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalConfirmButton: {
    flex: 0,
    width: '100%',
    marginTop: 17,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.grayscale[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 18,
    color: colors.grayscale[1000],
    fontFamily: fontFamily.bold,
  },
});
