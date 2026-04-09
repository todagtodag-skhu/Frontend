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
import { useCreateSungjangInviteCode, useTodakOnboarding } from '@/features/onboarding/hooks';
import { getTodakRelations } from '@/features/relation/api';
import { useUpdateSungjangInfo } from '@/features/relation/hooks';
import { toISODate } from '@/lib/dateUtils';
import { getPostLoginRoute } from '@/features/auth/routing';

export default function OnboardingScreen() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<'todagi' | 'growth' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [childName, setChildName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);

  const isTodagi = selectedRole === 'todagi';
  const isGrowth = selectedRole === 'growth';
  const totalSteps = isGrowth ? 3 : 5;
  const confirmLabel =
    (isGrowth && step === 2) || (isTodagi && step === 4) ? '시작하기' : '다음';

  const createSungjangInviteCode = useCreateSungjangInviteCode();
  const todakOnboarding = useTodakOnboarding();
  const updateSungjangInfo = useUpdateSungjangInfo();

  const isPending =
    createSungjangInviteCode.isPending ||
    todakOnboarding.isPending ||
    updateSungjangInfo.isPending;

  const handleShareInviteCode = async () => {
    if (!inviteCode) return;
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
        // 성장이: 서버에서 초대코드 발급 (PENDING 토큰 사용)
        createSungjangInviteCode.mutate(undefined, {
          onSuccess: (data) => {
            setInviteCode(data.inviteCode);
            setStep(1);
          },
          onError: () => {
            Alert.alert('오류', '초대코드 발급에 실패했습니다. 다시 시도해주세요.');
          },
        });
        return;
      }

      setStep(1);
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (isGrowth) {
      // 성장이 온보딩 완료 → 성장 화면으로
      router.replace(getPostLoginRoute('SUNGJANG'));
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

      // 토닥이: 초대코드로 역할 전환 + 관계 연결
      todakOnboarding.mutate(inviteCode.trim(), {
        onSuccess: () => {
          setStep(4);
        },
        onError: () => {
          Alert.alert('오류', '초대코드가 올바르지 않습니다. 다시 확인해주세요.');
        },
      });
      return;
    }

    // step === 4: 성장이 이름·생일 입력
    if (!childName.trim() || !birthday.trim()) {
      Alert.alert('알림', '이름과 생일을 모두 입력해주세요.');
      return;
    }

    // 방금 연결된 관계 ID 조회 후 성장이 정보 저장
    getTodakRelations()
      .then((data) => {
        const relation = data.relations[0];
        if (!relation) throw new Error('관계를 찾을 수 없습니다.');
        return relation.relationId;
      })
      .then((relationId) => {
        updateSungjangInfo.mutate(
          {
            relationId,
            sungjangName: childName.trim(),
            sungjangBirthday: toISODate(birthday.trim()),
          },
          {
            onSuccess: () => {
              router.replace(getPostLoginRoute('TODAGI'));
            },
            onError: () => {
              // 정보 저장 실패해도 온보딩은 완료로 처리
              router.replace(getPostLoginRoute('TODAGI'));
            },
          },
        );
      })
      .catch(() => {
        router.replace(getPostLoginRoute('TODAGI'));
      });
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
        confirmDisabled={isPending}
      >
        {step === 0 ? (
          <RoleSelectStep
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
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
                '스티커판을 생성할 때,\n완성시 보상을 꼭 정의해보세요.\n스티커판을 완성할 때 마다\n적절한 보상🎁 을 준다면 \n더 효과적인 활동이 될거예요!\n꼭 금전적인 보상이 아니어도 괜찮아요.'
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
