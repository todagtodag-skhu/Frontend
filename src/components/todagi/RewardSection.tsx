import { TextInput } from '@/components/common/TextInput';

import { Section } from './Section';

type RewardSectionProps = {
  rewardText: string;
  onChangeRewardText: (value: string) => void;
};

export function RewardSection({ rewardText, onChangeRewardText }: RewardSectionProps) {
  return (
    <Section title="최종 보상 설정">
      <TextInput
        placeholder="선물 내용을 작성해주세요."
        value={rewardText}
        onChangeText={onChangeRewardText}
      />
    </Section>
  );
}
