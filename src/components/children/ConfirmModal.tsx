import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { todagiStyles } from '@/components/todagi/styles';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  useModal?: boolean;
};

export function ConfirmModal({
  visible,
  title,
  confirmLabel = '확인',
  onConfirm,
  onCancel,
  useModal = true,
}: ConfirmModalProps) {
  if (!visible) {
    return null;
  }

  const content = (
    <View style={todagiStyles.modalOverlay}>
      <Pressable style={todagiStyles.modalBackdrop} onPress={onCancel} />
      <View style={[todagiStyles.modalContent, styles.content]}>
        <Text weight="bold" style={styles.title}>{title}</Text>
        <View style={styles.actions}>
          <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
            <Text weight="bold" style={styles.confirmText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (!useModal) {
    return content;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '80%',
    gap: 20,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.grayscale[1000],
    lineHeight: 26,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.grayscale[200],
  },
  confirmButton: {
    backgroundColor: '#FFF1CC',
    borderWidth: 1.5,
    borderColor: '#FFCF7D',
  },
  cancelText: {
    fontSize: 15,
    color: colors.grayscale[700],
  },
  confirmText: {
    fontSize: 15,
    color: '#8B5E1A',
  },
});
