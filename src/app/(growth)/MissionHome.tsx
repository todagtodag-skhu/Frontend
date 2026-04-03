import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  PanResponder,
  Modal,
  Pressable,
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
  const [likedMissionIds, setLikedMissionIds] = useState<string[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

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

  const toggleMissionHeart = (missionId: string) => {
    setLikedMissionIds((prev) =>
      prev.includes(missionId)
        ? prev.filter((id) => id !== missionId)
        : [...prev, missionId],
    );
  };

  const handleManageOpen = (mission: Mission) => {
    setSelectedMission(mission);
  };

  const handleManageClose = () => {
    setSelectedMission(null);
  };

  return (
    <SafeAreaView style={styles.safe} {...swipeResponder.panHandlers}>
      <View style={styles.container}>
        <Text style={styles.header}>
          {activeBoard ? `${activeBoard.title} 미션 목록` : '유진이의 미션 목록'}
        </Text>

        <View style={styles.page}>
          <View style={styles.heroCard}>
            <Ionicons name="heart" size={24} color="red" style={styles.heroEmoji} />
            <View style={{ flex: 1 }} />
            <Ionicons name="heart" size={24} color="red" style={styles.heroEmoji} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.missionList}
          >
            {activeBoard?.missions.map((mission) => (
              <MissionCard
                key={mission.id}
                title={mission.title}
                frequency={mission.frequency}
                reward={activeBoard.rewardText || '스티커 1개'}
                isHeartFilled={likedMissionIds.includes(mission.id)}
                onHeartPress={() => toggleMissionHeart(mission.id)}
                onManagePress={() => handleManageOpen(mission)}
              />
            ))}
            {!activeBoard?.missions.length ? (
              <Text style={styles.emptyText}>등록된 미션이 아직 없어요.</Text>
            ) : null}
          </ScrollView>

          <Text style={styles.progressText}>
            성장나무 완성까지 {likedMissionIds.length}/{PROGRESS_TOTAL} 개
          </Text>
        </View>
      </View>

      <Modal visible={selectedMission !== null} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={handleManageClose}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalCardWrap}>
            {selectedMission ? <StickerRequestButton onClose={handleManageClose} /> : null}
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
    marginBottom: 50,
  },
  progressHighlight: {
    color: '#4DA8E0',
    fontFamily: fontFamily.bold,
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
});
