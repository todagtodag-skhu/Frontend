import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { Text } from '@/components/ui/Text';

import { todagiStyles } from './styles';

type EmojiInputModalProps = {
  visible: boolean;
  value: string;
  onConfirm: (emoji: string) => void;
  onClose: () => void;
};

export function EmojiInputModal({
  visible,
  value,
  onConfirm,
  onClose,
}: EmojiInputModalProps) {
  const [localEmoji, setLocalEmoji] = useState(value);

  useEffect(() => {
    if (visible) {
      setLocalEmoji(value);
    }
  }, [value, visible]);

  const handleConfirm = () => {
    if (!localEmoji.trim()) {
      Alert.alert('알림', '이모지를 입력해주세요.');
      return;
    }

    onConfirm(localEmoji.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={todagiStyles.modalOverlay}>
        <Pressable style={todagiStyles.modalBackdrop} onPress={onClose} />
        <View style={todagiStyles.modalContent}>
          <Text style={todagiStyles.modalTitle}>미션 이모지 입력</Text>
          <Text style={todagiStyles.modalDescription}>
            기본 이모지 키보드에서 원하는 이모지를 입력하세요.
          </Text>
          <TextInput
            value={localEmoji}
            onChangeText={setLocalEmoji}
            placeholder="😀"
            style={todagiStyles.emojiInput}
          />
          <Button title="확인" onPress={handleConfirm} style={todagiStyles.modalConfirmButton} />
        </View>
      </View>
    </Modal>
  );
}
