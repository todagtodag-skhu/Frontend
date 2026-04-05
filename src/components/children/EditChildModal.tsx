import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { TextInput } from '@/components/common/TextInput';
import { todagiStyles } from '@/components/todagi/styles';
import { ChildProfile } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

type EditChildModalProps = {
  visible: boolean;
  child: ChildProfile;
  onSave: (name: string, birthday: string) => void;
  onClose: () => void;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function parseDate(value?: string) {
  if (!value) {
    return new Date();
  }

  const matched = value.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);

  if (!matched) {
    return new Date();
  }

  const [, yearText, monthText, dayText] = matched;
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(year, month, day);

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return new Date();
  }

  return date;
}

export function EditChildModal({ visible, child, onSave, onClose }: EditChildModalProps) {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [selectedBirthday, setSelectedBirthday] = useState(new Date());

  useEffect(() => {
    if (visible) {
      setName(child.name);
      setBirthday(child.birthday);
      setSelectedBirthday(parseDate(child.birthday));
    }
  }, [visible, child]);

  const handleSave = () => {
    if (!name.trim() || !birthday.trim()) return;
    onSave(name.trim(), birthday.trim());
  };

  const handleChangeBirthday = (_event: DateTimePickerEvent, nextDate?: Date) => {
    if (!nextDate) {
      return;
    }

    setSelectedBirthday(nextDate);
    setBirthday(formatDate(nextDate));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={todagiStyles.modalOverlay}>
        <Pressable style={todagiStyles.modalBackdrop} onPress={onClose} />
        <View style={[todagiStyles.modalContent, styles.content]}>
          <Text weight="bold" style={todagiStyles.modalTitle}>성장이 정보 수정</Text>

          <View style={styles.field}>
            <Text style={styles.label}>이름</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="성장이 이름"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>생년월일</Text>
            <View style={styles.birthdayField}>
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={selectedBirthday}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'compact' : 'default'}
                  locale="ko-KR"
                  maximumDate={new Date()}
                  onChange={handleChangeBirthday}
                  style={styles.picker}
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text weight="bold" style={styles.saveText}>저장</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '88%',
    gap: 16,
  },
  field: {
    gap: 6,
  },
  birthdayField: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    color: colors.grayscale[600],
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'left',
  },
  pickerWrap: {
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 8,
    paddingVertical: Platform.OS === 'ios' ? 2 : 0,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  picker: {
    alignSelf: 'flex-start',
    width: Platform.OS === 'ios' ? 104 : 140,
    height: Platform.OS === 'ios' ? 36 : 44,
    transform: Platform.OS === 'ios' ? [{ scale: 0.9 }] : undefined,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
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
  saveButton: {
    backgroundColor: '#FFF1CC',
    borderWidth: 1.5,
    borderColor: '#FFCF7D',
  },
  cancelText: {
    fontSize: 15,
    color: colors.grayscale[700],
  },
  saveText: {
    fontSize: 15,
    color: '#8B5E1A',
  },
});
