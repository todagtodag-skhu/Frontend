import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/constants/colors';
import { Text } from '@/components/ui/Text';

import { onboardingStyles } from './CommonOnboardingScreen';

type OnboardingLoadingStepProps = {
  title: string;
  description: string;
};

export function OnboardingLoadingStep({
  title,
  description,
}: OnboardingLoadingStepProps) {
  return (
    <>
      <Text weight="bold" style={onboardingStyles.title}>
        {title}
      </Text>
      <View style={onboardingStyles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary[700]} />
      </View>
      <Text style={onboardingStyles.infoDescription}>{description}</Text>
    </>
  );
}
