import { Text } from '@/components/ui/Text';

import { onboardingStyles } from './CommonOnboardingScreen';

type OnboardingInfoStepProps = {
  title: string;
  description: string;
};

export function OnboardingInfoStep({
  title,
  description,
}: OnboardingInfoStepProps) {
  return (
    <>
      <Text weight="bold" style={onboardingStyles.title}>
        {title}
      </Text>
      <Text style={onboardingStyles.infoDescription}>{description}</Text>
    </>
  );
}
