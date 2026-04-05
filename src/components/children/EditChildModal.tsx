import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { TextInput } from '@/components/common/TextInput';
import { CalendarModal } from '@/components/todagi/CalendarModal';
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

export function EditChildModal({ visible, child, onSave, onClose }: EditChildModalProps) {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(child.name);
      setBirthday(child.birthday);
    }
  }, [visible, child]);

  const handleSave = () => {
    if (!name.trim() || !birthday.trim()) return;
    onSave(name.trim(), birthday.trim());
  };

  return (
    <>
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
              <Pressable
                style={styles.dateField}
                onPress={() => setBirthdayModalVisible(true)}
              >
                <Text style={[styles.dateText, !birthday && styles.datePlaceholder]}>
                  {birthday || '생년월일을 선택해주세요'}
                </Text>
              </Pressable>
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

      <CalendarModal
        visible={birthdayModalVisible}
        value={birthday}
        title="생년월일 선택"
        onConfirm={setBirthday}
        onClose={() => setBirthdayModalVisible(false)}
      />
    </>
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
  label: {
    fontSize: 14,
    color: colors.grayscale[600],
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'left',
  },
  dateField: {
    borderRadius: 8,
    backgroundColor: colors.grayscale[200],
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    color: colors.grayscale[1000],
  },
  datePlaceholder: {
    color: colors.grayscale[400],
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
