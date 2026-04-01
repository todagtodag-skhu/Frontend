import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Share } from 'react-native';

import { ChildInfoStep } from '@/components/onboarding/ChildInfoStep';
import { CommonOnboardingScreen } from '@/components/onboarding/CommonOnboardingScreen';
import { InviteCodeStep } from '@/components/onboarding/InviteCodeStep';
import { InviteShareStep } from '@/components/onboarding/InviteShareStep';
import { OnboardingInfoStep } from '@/components/onboarding/OnboardingInfoStep';
import { RoleSelectStep } from '@/components/onboarding/RoleSelectStep';
import { CalendarModal } from '@/components/todagi/CalendarModal';
import { useGrowth } from '@/contexts/GrowthContext';

export default function OnboardingScreen() {
  const router = useRouter();
  const { addChild } = useGrowth();
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<'todagi' | 'growth' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [createdChildId, setCreatedChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);

  const isTodagi = selectedRole === 'todagi';
  const isGrowth = selectedRole === 'growth';
  const totalSteps = isGrowth ? 3 : 5;
  const confirmLabel =
    (isGrowth && step === 2) || (isTodagi && step === 4) ? '시작하기' : '다음';

  const generateInviteCode = () => Math.random().toString().slice(2, 8).padEnd(6, '0');

  const routeToChildren = (childId: string) => {
    router.replace({
      pathname: '/children',
      params: { focusChildId: childId },
    });
  };

  const routeToGrowth = () => {
    router.replace('/tree');
  };

  const handleSelectRole = (role: 'todagi' | 'growth') => {
    setSelectedRole(role);
  };

  const handleShareInviteCode = async () => {
    if (!inviteCode) {
      return;
    }

    await Share.share({
      message: `내 초대코드는 ${inviteCode} 이야. 토닥이 앱에서 이 코드를 입력해 연결해줘.`,
    });
  };

  const handleConfirm = () => {
    if (step === 0) {
      if (!selectedRole) {
        Alert.alert('알림', '역할을 선택해주세요.');
        return;
      }

      if (isGrowth) {
        const nextInviteCode = generateInviteCode();
        const childId = addChild({
          inviteCode: nextInviteCode,
          name: '성장이',
          birthday: '-',
        });

        setInviteCode(nextInviteCode);
        setCreatedChildId(childId);
        setStep(1);
        return;
      }

      setStep(1);
      return;
    }

    if (step === 1) {
      if (isGrowth) {
        setStep(2);
        return;
      }

      setStep(2);
      return;
    }

    if (isGrowth) {
      if (createdChildId) {
        routeToGrowth();
      }
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!inviteCode.trim()) {
        Alert.alert('알림', '초대코드를 입력해주세요.');
        return;
      }

      setStep(4);
      return;
    }

    if (!childName.trim() || !birthday.trim()) {
      Alert.alert('알림', '이름과 생일을 모두 입력해주세요.');
      return;
    }

    const childId = addChild({
      inviteCode: inviteCode.trim(),
      name: childName.trim(),
      birthday: birthday.trim(),
    });

    routeToChildren(childId);
  };

  const handleBack = () => {
    setStep((currentStep) => Math.max(0, currentStep - 1));
  };

  return (
    <>
      <CommonOnboardingScreen
        step={step}
        totalSteps={totalSteps}
        onBack={handleBack}
        confirmLabel={confirmLabel}
        onConfirm={handleConfirm}
      >
        {step === 0 ? (
          <RoleSelectStep
            selectedRole={selectedRole}
            onSelectRole={handleSelectRole}
          />
        ) : step === 1 ? (
          isGrowth ? (
            <OnboardingInfoStep
              title={'성장이를 선택하셨어요.'}
              description={
                '스티커판을 받고, \n다양한 미션을 수행하면서\n받은 스티커를 붙여보세요.🌱'
              }
            />
          ) : (
            <OnboardingInfoStep
              title={'토닥이를 선택하셨어요.'}
              description={
                '토닥이는 스티커판을 관리하고,\n다양한 미션을 부여하는 역할이에요.\n완료한 미션에 스티커를 지급하면서\n성장이에게 직접 붙이는 재미를 \n통해 건강한 습관개선방법을 \n학습시킬 수 있어요.'
              }
            />
          )
        ) : step === 2 ? (
          isGrowth ? (
            <InviteShareStep
              inviteCode={inviteCode}
              onPressShare={handleShareInviteCode}
            />
          ) : (
            <OnboardingInfoStep
              title={'보상체계를 활용해보세요.'}
              description={
                '스티커판을 생성할 때,\n완성시 보상을 꼭 정의해보세요.\n스티커판을 완성할 때 마다\n적절한 보상🎁 을 준다면 \n더 효과적인 활동이 될거에요!\n꼭 금전적인 보상이 아니어도 괜찮아요.'
              }
            />
          )
        ) : step === 3 ? (
          <InviteCodeStep
            title={'초대코드를 입력해주세요'}
            value={inviteCode}
            onChangeText={setInviteCode}
          />
        ) : (
          <ChildInfoStep
            title={'처음 함께할 성장이를\n등록해주세요.'}
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
