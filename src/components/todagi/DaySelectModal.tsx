import { useEffect, useState } from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={todagiStyles.modalOverlay}>
        <Pressable style={todagiStyles.modalBackdrop} onPress={onClose} />
        <View style={todagiStyles.modalContent}>
          <Text style={todagiStyles.modalTitle}>요일 선택</Text>
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
          <Button
            title="확인"
            onPress={() => {
              onConfirm(orderedDays);
              onClose();
            }}
            style={todagiStyles.modalConfirmButton}
          />
        </View>
      </View>
    </Modal>
  );
}
