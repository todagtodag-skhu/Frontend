import { Pressable, View } from 'react-native';

import { TextInput } from '@/components/common/TextInput';
import { Text } from '@/components/ui/Text';

import { onboardingStyles } from './CommonOnboardingScreen';

type ChildInfoStepProps = {
  title: string;
  childName: string;
  birthday: string;
  onChangeChildName: (text: string) => void;
  onPressBirthday: () => void;
  nameLabel?: string;
  namePlaceholder?: string;
  birthdayLabel?: string;
  birthdayPlaceholder?: string;
};

export function ChildInfoStep({
  title,
  childName,
  birthday,
  onChangeChildName,
  onPressBirthday,
  nameLabel = '성장이 이름 (최대 5자)',
  namePlaceholder = '성장이 이름',
  birthdayLabel = '성장이 생일',
  birthdayPlaceholder = '생년월일을 선택해주세요',
}: ChildInfoStepProps) {
  return (
    <>
      <Text weight="bold" style={onboardingStyles.title}>
        {title}
      </Text>

      <View style={onboardingStyles.form}>
        <View style={onboardingStyles.field}>
          <Text style={onboardingStyles.label}>{nameLabel}</Text>
          <TextInput
            value={childName}
            onChangeText={onChangeChildName}
            placeholder={namePlaceholder}
            align="left"
            style={onboardingStyles.fieldInput}
          />
        </View>
        <View style={onboardingStyles.field}>
          <Text style={onboardingStyles.label}>{birthdayLabel}</Text>
          <Pressable
            style={onboardingStyles.dateField}
            onPress={onPressBirthday}
          >
            <Text
              style={[
                onboardingStyles.dateFieldText,
                !birthday && onboardingStyles.dateFieldPlaceholder,
              ]}
            >
              {birthday || birthdayPlaceholder}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
