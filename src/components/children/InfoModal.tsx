import { StyleSheet } from 'react-native';

import { Button } from '@/components/common/Button';
import { AppModal } from '@/components/common/AppModal';
import { Text } from '@/components/ui/Text';

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
  return (
    <AppModal
      visible={visible}
      onClose={onConfirm}
      title={title}
      description={description}
      useModal={useModal}
      contentStyle={styles.content}
      footer={
        <Button
          title={confirmLabel}
          onPress={onConfirm}
          variant="chip"
          size="sm"
          style={styles.confirmButton}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    width: '80%',
  },
  confirmButton: {
    width: '100%',
    marginTop: 0,
  },
});
