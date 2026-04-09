import { TextInput } from '@/components/common/TextInput';
import { Text } from '@/components/ui/Text';

import { onboardingStyles } from './CommonOnboardingScreen';

type InviteCodeStepProps = {
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function InviteCodeStep({
  title,
  value,
  onChangeText,
  placeholder = '초대코드 입력',
}: InviteCodeStepProps) {
  return (
    <>
      <Text weight="bold" style={onboardingStyles.title}>
        {title}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={onboardingStyles.codeInput}
      />
    </>
  );
}
