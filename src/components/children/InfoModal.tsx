import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { todagiStyles } from '@/components/todagi/styles';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

type InfoModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  useModal?: boolean;
};

export function InfoModal({
  visible,
  title,
  description,
  confirmLabel = '확인',
  onConfirm,
  useModal = true,
}: InfoModalProps) {
  if (!visible) {
    return null;
  }

  const content = (
    <View style={todagiStyles.modalOverlay}>
      <Pressable style={todagiStyles.modalBackdrop} onPress={onConfirm} />
      <View style={[todagiStyles.modalContent, styles.content]}>
        <Text weight="bold" style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        <Pressable style={styles.confirmButton} onPress={onConfirm}>
          <Text weight="bold" style={styles.confirmText}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
  );

  if (!useModal) {
    return content;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onConfirm}>
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
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.grayscale[700],
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1CC',
    borderWidth: 1.5,
    borderColor: '#FFCF7D',
  },
  confirmText: {
    fontSize: 15,
    color: '#8B5E1A',
  },
});
