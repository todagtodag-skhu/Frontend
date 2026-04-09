import { useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { StickerRequest } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';
import { borderWidth } from '@/constants/borders';
import { colors } from '@/constants/colors';

import { ConfirmModal } from './ConfirmModal';
import { InfoModal } from './InfoModal';

type PendingAction = {
  type: 'accept' | 'reject';
  requestId: string;
  missionTitle: string;
};

type StickerRequestModalProps = {
  visible: boolean;
  childName: string;
  requests: StickerRequest[];
  previousRequests?: StickerRequest[];
  dismissedIds: Set<string>;
  onDismiss: (requestId: string, action: 'accept' | 'reject') => Promise<boolean>;
  onManualSticker: () => Promise<boolean>;
  onClose: () => void;
};

export function StickerRequestModal({ visible, childName, requests, previousRequests, dismissedIds, onDismiss, onManualSticker, onClose }: StickerRequestModalProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [resultModal, setResultModal] = useState<{ title: string; description?: string } | null>(null);

  const visibleRequests = requests.filter((r) => !dismissedIds.has(r.id));
  const visiblePreviousRequests = (previousRequests ?? []).filter((r) => !dismissedIds.has(r.id));
  const hasPreviousRequests = visiblePreviousRequests.length > 0;

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const success = await onDismiss(pendingAction.requestId, pendingAction.type);

    if (success) {
      if (pendingAction.type === 'accept') {
        setResultModal({
          title: '완료',
          description: `"${pendingAction.missionTitle}" 미션에 스티커를 지급했어요!`,
        });
      } else {
        setResultModal({
          title: '완료',
          description: `"${pendingAction.missionTitle}" 미션 요청을 거절했어요.`,
        });
      }
    }

    setPendingAction(null);
  };

  const renderRequestCard = (request: StickerRequest) => (
    <View key={request.id} style={styles.missionCard}>
      <Text style={styles.missionEmoji}>{request.missionEmoji}</Text>
      <View style={styles.missionInfo}>
        <Text weight="bold" style={styles.missionTitle}>{request.missionTitle}</Text>
        <Text style={styles.missionMeta}>스티커 {request.stickerCount}개</Text>
      </View>
      <View style={styles.actionColumn}>
        <Text style={styles.requestTime}>{request.requestedAt}</Text>
        <View style={styles.missionActions}>
          <Pressable
            style={[styles.actionChip, styles.rejectChip]}
            onPress={() => setPendingAction({ type: 'reject', requestId: request.id, missionTitle: request.missionTitle })}
          >
            <Text style={styles.rejectText}>거절</Text>
          </Pressable>
          <Pressable
            style={[styles.actionChip, styles.acceptChip]}
            onPress={() => setPendingAction({ type: 'accept', requestId: request.id, missionTitle: request.missionTitle })}
          >
            <Text style={styles.acceptText}>수락</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

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
          {hasPreviousRequests && (
            <View style={styles.section}>
              <Text weight="bold" style={styles.sectionTitle}>이전 스티커판 요청</Text>
              {visiblePreviousRequests.map((request) => renderRequestCard(request))}
            </View>
          )}

          <View style={styles.section}>
            {hasPreviousRequests && (
              <Text weight="bold" style={styles.sectionTitle}>현재 스티커판 요청</Text>
            )}
            {visibleRequests.length > 0 ? (
              visibleRequests.map((request) => renderRequestCard(request))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>요청된 미션이 없어요</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={styles.manualButton}
            onPress={async () => {
              const success = await onManualSticker();
              if (success) {
                setResultModal({ title: '스티커 지급', description: '칭찬스티커 1개를 부여했습니다' });
              }
            }}
          >
            <Text weight="bold" style={styles.manualButtonText}>수동으로 스티커 주기</Text>
          </Pressable>
        </View>

        <ConfirmModal
          visible={pendingAction !== null}
          title={pendingAction?.type === 'accept' ? '정말 수락할까요?' : '정말 거절할까요?'}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
          useModal={false}
        />
        <InfoModal
          visible={resultModal !== null}
          title={resultModal?.title ?? ''}
          description={resultModal?.description}
          onConfirm={() => setResultModal(null)}
          useModal={false}
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
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    color: colors.grayscale[600],
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    borderWidth: borderWidth.strong,
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
  actionColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  requestTime: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.grayscale[500],
    textAlign: 'right',
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
    borderWidth: borderWidth.emphasis,
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
