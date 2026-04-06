import { Pressable, StyleSheet, View } from 'react-native';

import { TextInput } from '@/components/common/TextInput';
import { Text } from '@/components/ui/Text';
import { borderWidth } from '@/constants/borders';
import { colors } from '@/constants/colors';

import { Mission } from './types';

type MissionEditCardProps = {
  mission: Mission;
  onPressEmoji: () => void;
  onChangeTitle: (title: string) => void;
  onChangeCompletionCount: (count: number) => void;
  onChangeStickerPerCompletion: (count: number) => void;
  onDelete: () => void;
};

const COMPLETION_MIN = 1;
const COMPLETION_MAX = 30;
const STICKER_MIN = 1;
const STICKER_MAX = 7;
const TITLE_MAX_LENGTH = 15;

export function MissionEditCard({
  mission,
  onPressEmoji,
  onChangeTitle,
  onChangeCompletionCount,
  onChangeStickerPerCompletion,
  onDelete,
}: MissionEditCardProps) {
  const completionCount = mission.completionCount ?? 1;
  const stickerPerCompletion = mission.stickerPerCompletion ?? 1;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Pressable style={styles.emojiBox} onPress={onPressEmoji}>
          <Text style={styles.emojiText}>{mission.emoji}</Text>
        </Pressable>

        <TextInput
          align="left"
          size="md"
          style={styles.titleInput}
          value={mission.title}
          onChangeText={(text) => onChangeTitle(text.slice(0, TITLE_MAX_LENGTH))}
          placeholder="미션 이름"
          placeholderTextColor={colors.grayscale[300]}
          maxLength={TITLE_MAX_LENGTH}
        />

        <Pressable style={styles.deleteButton} onPress={onDelete} hitSlop={8}>
          <Text style={styles.deleteText}>삭제</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.stepperRow}>
        <View style={styles.stepperCopy}>
          <Text weight="bold" style={styles.stepperLabel}>달성 횟수</Text>
          <Text style={styles.stepperHint}>몇 번 수행하면 완료로 볼지 정해요.</Text>
        </View>
        <Stepper value={completionCount} unit="회" min={COMPLETION_MIN} max={COMPLETION_MAX} onChange={onChangeCompletionCount} />
      </View>

      <View style={styles.stepperRow}>
        <View style={styles.stepperCopy}>
          <Text weight="bold" style={styles.stepperLabel}>스티커 개수</Text>
          <Text style={styles.stepperHint}>완료 시 줄 스티커 수량이에요.</Text>
        </View>
        <Stepper value={stickerPerCompletion} unit="개" min={STICKER_MIN} max={STICKER_MAX} onChange={onChangeStickerPerCompletion} />
      </View>
    </View>
  );
}

type StepperProps = {
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

function Stepper({ value, unit, min, max, onChange }: StepperProps) {
  return (
    <View style={styles.stepper}>
      <Pressable
        style={styles.stepperBtn}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        hitSlop={6}
      >
        <Text weight="bold" style={[styles.stepperBtnText, value <= min && styles.stepperBtnDisabled]}>−</Text>
      </Pressable>

      <View style={styles.stepperValueBox}>
        <Text weight="bold" style={styles.stepperValue}>{value}{unit}</Text>
      </View>

      <Pressable
        style={styles.stepperBtn}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        hitSlop={6}
      >
        <Text weight="bold" style={[styles.stepperBtnText, value >= max && styles.stepperBtnDisabled]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    padding: 18,
    gap: 16,
    borderWidth: borderWidth.hairline,
    borderColor: '#EEE4D6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary[700],
    borderWidth: borderWidth.hairline,
    borderColor: '#F0E3C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  titleInput: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
  },
  deleteButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FDE8E8',
    borderWidth: borderWidth.hairline,
    borderColor: '#F4C6C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 13,
    color: '#B54747',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFE7DB',
    marginHorizontal: -18,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepperCopy: {
    flex: 1,
    gap: 4,
  },
  stepperLabel: {
    fontSize: 15,
    color: colors.grayscale[1000],
  },
  stepperHint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.grayscale[600],
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF3DA',
    borderWidth: borderWidth.hairline,
    borderColor: '#F2DFC1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    color: '#8B5E1A',
    lineHeight: 20,
  },
  stepperBtnDisabled: {
    color: colors.grayscale[300],
  },
  stepperValueBox: {
    minWidth: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.grayscale[200],
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 16,
    color: colors.grayscale[1000],
    textAlign: 'center',
  },
});
