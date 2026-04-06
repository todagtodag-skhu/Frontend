import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { AppModal } from '@/components/common/AppModal';
import { Button } from '@/components/common/Button';
import { Text } from '@/components/ui/Text';

import { DAY_OPTIONS } from './constants';
import { todagiStyles } from './styles';

type DaySelectModalProps = {
  visible: boolean;
  selectedDays: string[];
  onConfirm: (days: string[]) => void;
  onClose: () => void;
};

export function DaySelectModal({
  visible,
  selectedDays,
  onConfirm,
  onClose,
}: DaySelectModalProps) {
  const [localDays, setLocalDays] = useState<string[]>(selectedDays);

  useEffect(() => {
    if (visible) {
      setLocalDays(selectedDays);
    }
  }, [selectedDays, visible]);

  const toggleDay = (day: string) => {
    setLocalDays((prev) =>
      prev.includes(day) ? prev.filter((selectedDay) => selectedDay !== day) : [...prev, day]
    );
  };

  const orderedDays = DAY_OPTIONS.filter((day) => localDays.includes(day));

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="요일 선택"
      footer={
        <Button
          title="확인"
          onPress={() => {
            onConfirm(orderedDays);
            onClose();
          }}
          style={todagiStyles.modalConfirmButton}
        />
      }
    >
      <View style={todagiStyles.dayRow}>
        {DAY_OPTIONS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              todagiStyles.dayChip,
              localDays.includes(day) && todagiStyles.dayChipSelected,
            ]}
            onPress={() => toggleDay(day)}
          >
            <Text
              style={[
                todagiStyles.dayChipText,
                localDays.includes(day) && todagiStyles.dayChipTextSelected,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </AppModal>
  );
}
