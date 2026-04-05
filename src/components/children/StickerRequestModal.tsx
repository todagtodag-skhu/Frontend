import { useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Mission } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

import { ConfirmModal } from './ConfirmModal';

type PendingAction = {
  type: 'accept' | 'reject';
  missionId: string;
  missionTitle: string;
};

type StickerRequestModalProps = {
  visible: boolean;
  childName: string;
  missions: Mission[];
  dismissedIds: Set<string>;
  onDismiss: (missionId: string) => void;
  onClose: () => void;
};

export function StickerRequestModal({ visible, childName, missions, dismissedIds, onDismiss, onClose }: StickerRequestModalProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const visibleMissions = missions.filter((m) => !dismissedIds.has(m.id));

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'accept') {
      Alert.alert('완료', `"${pendingAction.missionTitle}" 미션에 스티커를 지급했어요! 🌟`);
    } else {
      Alert.alert('완료', `"${pendingAction.missionTitle}" 미션 요청을 거절했어요.`);
    }

    onDismiss(pendingAction.missionId);
    setPendingAction(null);
  };

  const handleManualSticker = () => {
    Alert.alert('스티커 지급', `${childName}에게 스티커를 지급했어요! 🌟`);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text weight="bold" style={styles.headerTitle}>성장이가 요청했어요</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.grayscale[700]} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {visibleMissions.length > 0 ? (
            visibleMissions.map((mission) => (
              <View key={mission.id} style={styles.missionCard}>
                <Text style={styles.missionEmoji}>{mission.emoji}</Text>
                <View style={styles.missionInfo}>
                  <Text weight="bold" style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.missionMeta}>{mission.frequency}</Text>
                </View>
                <View style={styles.missionActions}>
                  <Pressable
                    style={[styles.actionChip, styles.rejectChip]}
                    onPress={() =>
                      setPendingAction({ type: 'reject', missionId: mission.id, missionTitle: mission.title })
                    }
                  >
                    <Text style={styles.rejectText}>거절</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionChip, styles.acceptChip]}
                    onPress={() =>
                      setPendingAction({ type: 'accept', missionId: mission.id, missionTitle: mission.title })
                    }
                  >
                    <Text style={styles.acceptText}>수락</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>요청된 미션이 없어요</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.manualButton} onPress={handleManualSticker}>
            <Text weight="bold" style={styles.manualButtonText}>수동으로 스티커 주기</Text>
          </Pressable>
        </View>

        <ConfirmModal
          visible={pendingAction !== null}
          title={pendingAction?.type === 'accept' ? '정말 수락할까요?' : '정말 거절할까요?'}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary[700],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 22,
    color: colors.grayscale[1000],
  },
  closeButton: {
    position: 'absolute',
    right: 24,
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 12,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8E3DC',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  missionEmoji: {
    fontSize: 30,
    lineHeight: 34,
  },
  missionInfo: {
    flex: 1,
    gap: 2,
  },
  missionTitle: {
    fontSize: 18,
    color: colors.grayscale[1000],
  },
  missionMeta: {
    fontSize: 14,
    color: '#4F4A44',
  },
  missionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  rejectChip: {
    backgroundColor: '#FDE8E8',
  },
  acceptChip: {
    backgroundColor: '#FFF2D9',
  },
  rejectText: {
    fontSize: 14,
    color: '#B54747',
  },
  acceptText: {
    fontSize: 14,
    color: '#8B5E1A',
  },
  emptyCard: {
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6D665E',
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
  },
  manualButton: {
    borderRadius: 12,
    backgroundColor: '#FFF1CC',
    borderWidth: 2,
    borderColor: '#FFCF7D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  manualButtonText: {
    fontSize: 20,
    color: colors.grayscale[1000],
  },
});
