import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/fonts';

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
          style={styles.titleInput}
          value={mission.title}
          onChangeText={(text) => onChangeTitle(text.slice(0, TITLE_MAX_LENGTH))}
          placeholder="미션 이름"
          placeholderTextColor={colors.grayscale[300]}
          maxLength={TITLE_MAX_LENGTH}
        />

        <Pressable onPress={onDelete} hitSlop={8}>
          <Text style={styles.deleteText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.stepperRow}>
        <Text style={styles.stepperLabel}>달성 횟수</Text>
        <Stepper value={completionCount} unit="회" min={COMPLETION_MIN} max={COMPLETION_MAX} onChange={onChangeCompletionCount} />
      </View>

      <View style={styles.stepperRow}>
        <Text style={styles.stepperLabel}>스티커 개수</Text>
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
        <Text style={[styles.stepperBtnText, value <= min && styles.stepperBtnDisabled]}>−</Text>
      </Pressable>

      <Text weight="bold" style={styles.stepperValue}>{value}{unit}</Text>

      <Pressable
        style={styles.stepperBtn}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        hitSlop={6}
      >
        <Text style={[styles.stepperBtnText, value >= max && styles.stepperBtnDisabled]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#EDE8E0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF3DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    color: colors.grayscale[1000],
    paddingVertical: 0,
    fontFamily: fontFamily.regular,
  },
  deleteText: {
    fontSize: 16,
    color: colors.grayscale[400],
  },
  divider: {
    height: 1,
    backgroundColor: '#EDE8E0',
    marginHorizontal: -20,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperLabel: {
    fontSize: 15,
    color: '#8A8278',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF3DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    color: colors.grayscale[1000],
    lineHeight: 20,
  },
  stepperBtnDisabled: {
    color: colors.grayscale[300],
  },
  stepperValue: {
    fontSize: 16,
    color: colors.grayscale[1000],
    minWidth: 40,
    textAlign: 'center',
  },
});
