import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { AppModal } from '@/components/common/AppModal';
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
    <AppModal
      visible={visible}
      onClose={onClose}
      title="미션 이모지 입력"
      description="기본 이모지 키보드에서 원하는 이모지를 입력하세요."
      footer={<Button title="확인" onPress={handleConfirm} style={todagiStyles.modalConfirmButton} />}
    >
      <TextInput
        value={localEmoji}
        onChangeText={setLocalEmoji}
        placeholder="😀"
        size="md"
        style={todagiStyles.emojiInput}
      />
    </AppModal>
  );
}
