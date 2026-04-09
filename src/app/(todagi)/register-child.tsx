import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { ChildInfoStep } from '@/components/onboarding/ChildInfoStep';
import { CommonOnboardingScreen } from '@/components/onboarding/CommonOnboardingScreen';
import { InviteCodeStep } from '@/components/onboarding/InviteCodeStep';
import { CalendarModal } from '@/components/todagi/CalendarModal';
import { useConnectTodak } from '@/features/relation/hooks';
import { useUpdateSungjangInfo } from '@/features/relation/hooks';
import { toISODate } from '@/lib/dateUtils';

export default function RegisterChildScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [childName, setChildName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);
  const [connectedRelationId, setConnectedRelationId] = useState<number | null>(null);

  const connectTodak = useConnectTodak();
  const updateSungjangInfo = useUpdateSungjangInfo();

  const isPending = connectTodak.isPending || updateSungjangInfo.isPending;

  const handleConfirm = () => {
    if (step === 0) {
      if (!inviteCode.trim()) {
        Alert.alert('알림', '초대코드를 입력해주세요.');
        return;
      }

      connectTodak.mutate(inviteCode.trim(), {
        onSuccess: (data) => {
          setConnectedRelationId(data.relationId);
          setStep(1);
        },
        onError: () => {
          Alert.alert('오류', '초대코드가 올바르지 않거나 이미 연결된 관계입니다.');
        },
      });
      return;
    }

    if (!childName.trim() || !birthday.trim()) {
      Alert.alert('알림', '이름과 생일을 모두 입력해주세요.');
      return;
    }

    if (!connectedRelationId) return;

    updateSungjangInfo.mutate(
      {
        relationId: connectedRelationId,
        sungjangName: childName.trim(),
        sungjangBirthday: toISODate(birthday.trim()),
      },
      {
        onSuccess: () => {
          router.replace({
            pathname: '/children',
            params: { focusChildId: connectedRelationId.toString() },
          });
        },
        onError: () => {
          Alert.alert('오류', '성장이 정보 저장에 실패했습니다.');
        },
      },
    );
  };

  const handleBack = () => {
    setStep((currentStep) => Math.max(0, currentStep - 1));
  };

  return (
    <>
      <CommonOnboardingScreen
        step={step}
        totalSteps={2}
        onBack={handleBack}
        confirmLabel={step === 0 ? '다음' : '확인'}
        onConfirm={handleConfirm}
        confirmDisabled={isPending}
      >
        {step === 0 ? (
          <InviteCodeStep
            title="초대코드를 입력해주세요"
            value={inviteCode}
            onChangeText={setInviteCode}
          />
        ) : (
          <ChildInfoStep
            title={'성장이 정보를\n기록해주세요.'}
            childName={childName}
            birthday={birthday}
            onChangeChildName={setChildName}
            onPressBirthday={() => setBirthdayModalVisible(true)}
          />
        )}
      </CommonOnboardingScreen>

      <CalendarModal
        visible={birthdayModalVisible}
        value={birthday}
        title="생일 선택"
        onConfirm={setBirthday}
        onClose={() => setBirthdayModalVisible(false)}
      />
    </>
  );
}
