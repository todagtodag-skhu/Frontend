import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { ChildInfoStep } from '@/components/onboarding/ChildInfoStep';
import { CommonOnboardingScreen } from '@/components/onboarding/CommonOnboardingScreen';
import { InviteCodeStep } from '@/components/onboarding/InviteCodeStep';
import { CalendarModal } from '@/components/todagi/CalendarModal';
import { useGrowth } from '@/contexts/GrowthContext';

export default function RegisterChildScreen() {
  const router = useRouter();
  const { addChild } = useGrowth();
  const [step, setStep] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [childName, setChildName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);

  const handleConfirm = async () => {
    if (step === 0) {
      if (!inviteCode.trim()) {
        Alert.alert('알림', '초대코드를 입력해주세요.');
        return;
      }

      setStep(1);
      return;
    }

    if (!childName.trim() || !birthday.trim()) {
      Alert.alert('알림', '이름과 생일을 모두 입력해주세요.');
      return;
    }

    const childId = await addChild({
      inviteCode: inviteCode.trim(),
      name: childName.trim(),
      birthday: birthday.trim(),
    });

    router.replace({
      pathname: '/children',
      params: { focusChildId: childId },
    });
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
