import React, { useMemo, useState } from 'react';
import {
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
import { useGrowth } from '@/contexts/GrowthContext';
import { Mission } from '@/components/todagi/types';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROGRESS_TOTAL = 20;

const MissionListScreen: React.FC = () => {
  const { activeStickerBoard } = useGrowth();
  const activeBoard = activeStickerBoard;
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [showSelectMissionNotice, setShowSelectMissionNotice] = useState(false);
  const [showRequestCompleteNotice, setShowRequestCompleteNotice] = useState(false);

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
    setSelectedMissionId(missionId);
  };

  const handleStickerRequestConfirm = () => {
    if (!selectedMissionId) {
      setSelectedMission(null);
      setShowSelectMissionNotice(true);
      return;
    }

    setSelectedMission(null);
    setShowRequestCompleteNotice(true);
  };

  const handleRequestStickerPress = () => {
    if (!activeBoard?.missions.length) {
      return;
    }

    if (!selectedMissionId) {
      setShowSelectMissionNotice(true);
      return;
    }

    const missionToOpen =
      activeBoard.missions.find((mission) => mission.id === selectedMissionId) ?? activeBoard.missions[0];

    setSelectedMission(missionToOpen);
  };

  return (
    <SafeAreaView style={styles.safe} {...swipeResponder.panHandlers}>
      <View style={styles.container}>
        <Text style={styles.header}>
          {activeBoard ? `${activeBoard.title} 미션 목록` : '유진이의 미션 목록'}
        </Text>

        <View style={styles.page}>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.missionList}
          >
            {activeBoard?.missions.map((mission) => (
              <MissionCard
                key={mission.id}
                emoji={mission.emoji}
                title={mission.title}
                frequency={mission.frequency}
                reward={activeBoard.rewardText || '스티커 1개'}
                isSelected={selectedMissionId === mission.id}
                onPress={() => handleMissionPress(mission.id)}
                onManagePress={() => handleManageOpen(mission)}
              />
            ))}
            {!activeBoard?.missions.length ? (
              <Text style={styles.emptyText}>등록된 미션이 아직 없어요.</Text>
            ) : null}
          </ScrollView>

          <Text style={styles.progressText}>
            성장나무 완성까지 0/{PROGRESS_TOTAL} 개
          </Text>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestStickerPress}
            activeOpacity={0.85}
          >
            <Text style={styles.requestButtonText}>스티커 조르기</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={selectedMission !== null} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={handleManageClose}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalCardWrap}>
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
        <Pressable style={styles.modalOverlay} onPress={() => setShowSelectMissionNotice(false)}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.noticeCardWrap}>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                먼저 완료한 항목을 고르고{'\n'}조르기 버튼을 눌러주세요.
              </Text>

              <TouchableOpacity
                style={styles.noticeButton}
                onPress={() => setShowSelectMissionNotice(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.noticeButtonText}>네</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showRequestCompleteNotice} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowRequestCompleteNotice(false)}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.noticeCardWrap}>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                요청 완료!{'\n'}부모님께 스티커 요청을 보냈어요.
              </Text>

              <TouchableOpacity
                style={styles.noticeButton}
                onPress={() => setShowRequestCompleteNotice(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.noticeButtonText}>네</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 32,
  },
  page: {
    paddingHorizontal: 20,
    flex: 1,
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
    marginBottom: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCardWrap: {
    width: '76%',
    alignItems: 'center',
  },
  noticeCardWrap: {
    width: '76%',
    alignItems: 'center',
  },
  noticeCard: {
    width: '108%',
    backgroundColor: '#E9DFC8',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFD89A',
    paddingTop: 36,
    paddingRight: 22,
    paddingBottom: 16,
    paddingLeft: 22,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 22,
    lineHeight: 26,
    color: '#2B2118',
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: 30,
  },
  noticeButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeButtonText: {
    fontSize: 20,
    color: '#111111',
    fontFamily: fontFamily.bold,
  },
});
