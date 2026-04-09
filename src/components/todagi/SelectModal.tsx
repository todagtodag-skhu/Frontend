import { TouchableOpacity } from 'react-native';

import { AppModal } from '@/components/common/AppModal';
import { Text } from '@/components/ui/Text';

import { todagiStyles } from './styles';

type SelectModalProps = {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
};

export function SelectModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
}: SelectModalProps) {
  return (
    <AppModal visible={visible} onClose={onClose} title={title}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={todagiStyles.modalOption}
          onPress={() => {
            onSelect(option);
            onClose();
          }}
        >
          <Text style={todagiStyles.modalOptionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </AppModal>
  );
}
