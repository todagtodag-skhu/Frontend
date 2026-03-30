import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { onboardingStyles } from './CommonOnboardingScreen';

type InviteShareStepProps = {
  inviteCode: string;
  onPressShare: () => void;
};

export function InviteShareStep({
  inviteCode,
  onPressShare,
}: InviteShareStepProps) {
  return (
    <>
      <Text weight="bold" style={onboardingStyles.title}>
        {'초대코드를\n토닥이에게 공유해 주세요'}
      </Text>
      <View style={onboardingStyles.shareCard}>
        <Text style={onboardingStyles.shareLabel}>내 초대코드</Text>
        <Text style={onboardingStyles.shareCode}>{inviteCode}</Text>
        <Text style={onboardingStyles.shareDescription}>
          토닥이가 이 코드를 입력하면 연결할 수 있어요.
        </Text>
      </View>
      <Pressable onPress={onPressShare} style={onboardingStyles.shareButton}>
        <Text style={onboardingStyles.shareButtonText}>초대코드 공유하기</Text>
      </Pressable>
    </>
  );
}
