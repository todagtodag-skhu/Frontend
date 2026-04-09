import { StyleSheet, View } from 'react-native';

import { AppModal } from '@/components/common/AppModal';
import { Button } from '@/components/common/Button';

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
  return (
    <AppModal
      visible={visible}
      onClose={onCancel}
      title={title}
      useModal={useModal}
      contentStyle={styles.content}
      footer={
        <View style={styles.actions}>
          <Button title="취소" onPress={onCancel} variant="secondary" size="sm" style={styles.button} />
          <Button title={confirmLabel} onPress={onConfirm} variant="chip" size="sm" style={styles.button} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    width: '80%',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    marginTop: 0,
  },
});
