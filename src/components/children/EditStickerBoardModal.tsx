import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TextInput } from '@/components/common/TextInput';
import { todagiStyles } from '@/components/todagi/styles';
import { StickerBoard } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

const BOARD_DESIGNS = ['호랑이', '고양이', '레서판다'] as const;

type EditStickerBoardModalProps = {
  visible: boolean;
  board: StickerBoard;
  onSave: (title: string, stickerCount: string, boardDesign: string, rewardText: string) => void;
  onClose: () => void;
};

export function EditStickerBoardModal({ visible, board, onSave, onClose }: EditStickerBoardModalProps) {
  const [title, setTitle] = useState('');
  const [stickerCount, setStickerCount] = useState('');
  const [boardDesign, setBoardDesign] = useState('');
  const [rewardText, setRewardText] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(board.title);
      setStickerCount(board.stickerCount.replace(/[^0-9]/g, ''));
      setBoardDesign(board.boardDesign);
      setRewardText(board.rewardText);
    }
  }, [visible, board]);

  const handleSave = () => {
    if (!title.trim() || !stickerCount.trim() || !boardDesign || !rewardText.trim()) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    const count = parseInt(stickerCount, 10);
    if (isNaN(count) || count <= 0) {
      Alert.alert('알림', '스티커 개수를 올바르게 입력해주세요.');
      return;
    }

    onSave(title.trim(), `${count}개`, boardDesign, rewardText.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={todagiStyles.modalOverlay}>
        <Pressable style={todagiStyles.modalBackdrop} onPress={onClose} />
        <View style={[todagiStyles.modalContent, styles.content]}>
          <Text weight="bold" style={todagiStyles.modalTitle}>스티커판 수정</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            <View style={styles.fields}>
              <View style={styles.field}>
                <Text style={styles.label}>스티커판 이름</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="스티커판 이름"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>스티커 개수</Text>
                <TextInput
                  value={stickerCount}
                  onChangeText={setStickerCount}
                  placeholder="예: 20"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>판 디자인</Text>
                <View style={styles.designRow}>
                  {BOARD_DESIGNS.map((design) => (
                    <Pressable
                      key={design}
                      style={[styles.designChip, boardDesign === design && styles.designChipSelected]}
                      onPress={() => setBoardDesign(design)}
                    >
                      <Text style={[styles.designChipText, boardDesign === design && styles.designChipTextSelected]}>
                        {design}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>최종 보상</Text>
                <TextInput
                  value={rewardText}
                  onChangeText={setRewardText}
                  placeholder="보상 내용을 입력해주세요"
                  style={styles.input}
                />
              </View>
            </View>
          </ScrollView>

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
    width: '90%',
    maxHeight: '82%',
    gap: 16,
  },
  scroll: {
    flexGrow: 0,
  },
  fields: {
    gap: 14,
    paddingBottom: 4,
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
  designRow: {
    flexDirection: 'row',
    gap: 8,
  },
  designChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.grayscale[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  designChipSelected: {
    backgroundColor: '#FFF1CC',
    borderWidth: 1.5,
    borderColor: '#FFCF7D',
  },
  designChipText: {
    fontSize: 14,
    color: colors.grayscale[600],
  },
  designChipTextSelected: {
    color: '#8B5E1A',
    fontWeight: '700',
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
