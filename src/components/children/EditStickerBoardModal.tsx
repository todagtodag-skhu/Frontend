import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppModal } from '@/components/common/AppModal';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { BOARD_DESIGN_OPTIONS, STICKER_COUNT_OPTIONS } from '@/components/todagi/constants';
import { StickerBoard } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';
import { borderWidth } from '@/constants/borders';
import { colors } from '@/constants/colors';

type EditStickerBoardModalProps = {
  visible: boolean;
  board?: StickerBoard;
  mode?: 'create' | 'edit';
  onSave: (title: string, stickerCount: string, boardDesign: string, rewardText: string) => void;
  onClose: () => void;
};

export function EditStickerBoardModal({ visible, board, mode = 'edit', onSave, onClose }: EditStickerBoardModalProps) {
  const [title, setTitle] = useState('');
  const [stickerCount, setStickerCount] = useState('');
  const [boardDesign, setBoardDesign] = useState('');
  const [rewardText, setRewardText] = useState('');

  useEffect(() => {
    if (visible) {
      if (board) {
        setTitle(board.title);
        setStickerCount(board.stickerCount.replace(/[^0-9]/g, ''));
        setBoardDesign(board.boardDesign);
        setRewardText(board.rewardText);
      } else {
        setTitle('');
        setStickerCount('');
        setBoardDesign('');
        setRewardText('');
      }
    }
  }, [visible, board]);

  const handleSave = () => {
    if (!title.trim() || !stickerCount.trim() || !boardDesign || !rewardText.trim()) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    onSave(title.trim(), stickerCount, boardDesign, rewardText.trim());
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? '스티커판 만들기' : '스티커판 수정'}
      contentStyle={styles.content}
      footer={
        <View style={styles.actions}>
          <Button title="취소" onPress={onClose} variant="secondary" size="sm" style={styles.button} />
          <Button
            title={mode === 'create' ? '다음' : '저장'}
            onPress={handleSave}
            variant="chip"
            size="sm"
            style={styles.button}
          />
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.fields}>
          <View style={styles.field}>
            <Text style={styles.label}>스티커판 이름</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="스티커판 이름"
              align="left"
              size="sm"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>스티커 개수</Text>
            <View style={styles.designRow}>
              {STICKER_COUNT_OPTIONS.map((count) => (
                <Pressable
                  key={count}
                  style={[styles.designChip, stickerCount === count && styles.designChipSelected]}
                  onPress={() => setStickerCount(count)}
                >
                  <Text
                    style={[
                      styles.designChipText,
                      stickerCount === count && styles.designChipTextSelected,
                    ]}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>판 디자인</Text>
            <View style={styles.designRow}>
              {BOARD_DESIGN_OPTIONS.map((design) => (
                <Pressable
                  key={design}
                  style={[styles.designChip, boardDesign === design && styles.designChipSelected]}
                  onPress={() => setBoardDesign(design)}
                >
                  <Text
                    style={[styles.designChipText, boardDesign === design && styles.designChipTextSelected]}
                  >
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
              align="left"
              size="sm"
              style={styles.input}
            />
          </View>
        </View>
      </ScrollView>
    </AppModal>
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
    borderWidth: borderWidth.strong,
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
    marginTop: 0,
  },
});
