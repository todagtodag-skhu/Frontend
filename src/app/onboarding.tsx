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
import * as authApi from '@/features/auth/api';
import { getAuthSession, saveAuthSession } from '@/features/auth/session';
import { updateChild } from '@/features/children/api';
import { getRelations } from '@/features/relation/api';

export default function OnboardingScreen() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<'todagi' | 'growth' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectedRelationId, setConnectedRelationId] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);

  const isTodagi = selectedRole === 'todagi';
  const isGrowth = selectedRole === 'growth';
  const totalSteps = isGrowth ? 3 : 5;

  const confirmLabel =
    (isGrowth && step === 2)
      ? '연결 확인하기'
      : (isTodagi && step === 4)
      ? '시작하기'
      : '다음';

  const routeToTodagiHome = () => router.replace('/(tabs)/children');

  const handleShareInviteCode = async () => {
    if (!inviteCode) return;
    await Share.share({
      message: `내 초대코드는 ${inviteCode} 이야. 토닥이 앱에서 이 코드를 입력해 연결해줘.`,
    });
  };

  const handleConfirm = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      if (step === 0) {
        if (!selectedRole) {
          Alert.alert('알림', '역할을 선택해주세요.');
          return;
        }

        if (isGrowth) {
          const session = await getAuthSession();
          if (!session) {
            Alert.alert('알림', '로그인 정보를 찾을 수 없습니다.');
            return;
          }
          try {
            const response = await authApi.requestSungjangInviteCode(session.accessToken);
            setInviteCode(response.inviteCode);
            setStep(1);
          } catch (error) {
            Alert.alert(
              '초대코드 발급 실패',
              error instanceof Error ? error.message : '초대코드를 발급받는데 실패했습니다.'
            );
          }
          return;
        }

        setStep(1);
        return;
      }

      if (step === 1) {
        setStep(2);
        return;
      }

      if (step === 2) {
        if (isGrowth) {
          try {
            await authApi.refreshAccessToken();
            const session = await getAuthSession();

            if (session?.role !== 'SUNGJANG') {
              Alert.alert(
                '아직 연결 전이에요',
                '토닥이가 아직 초대코드를 입력하지 않았어요.\n초대코드를 공유하고 기다려주세요.'
              );
            }
          } catch {
            Alert.alert(
              '확인 실패',
              '연결 상태를 확인하지 못했어요. 잠시 후 다시 시도해주세요.'
            );
          }
          return;
        }

        setStep(3);
        return;
      }

      if (step === 3 && isTodagi) {
        if (!inviteCode.trim()) {
          Alert.alert('알림', '초대코드를 입력해주세요.');
          return;
        }

        const session = await getAuthSession();
        if (!session) {
          Alert.alert('알림', '로그인 정보를 찾을 수 없습니다.');
          return;
        }

        try {
          const response = await authApi.connectWithInviteCode(
            session.accessToken,
            inviteCode.trim()
          );

          await saveAuthSession({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            role: response.role,
          });

          try {
            const relations = await getRelations();
            const first = relations.relations[0];
            if (first?.relationId) {
              setConnectedRelationId(first.relationId.toString());
            }
          } catch {}

          setStep(4);
        } catch (error) {
          Alert.alert(
            '연결 실패',
            error instanceof Error ? error.message : '초대코드 연결에 실패했습니다.'
          );
        }
        return;
      }

      if (step === 4 && isTodagi) {
        if (!childName.trim()) {
          Alert.alert('알림', '성장이 이름을 입력해주세요.');
          return;
        }
        if (!birthday.trim()) {
          Alert.alert('알림', '성장이 생년월일을 선택해주세요.');
          return;
        }

        let relationId = connectedRelationId;

        if (!relationId) {
          try {
            const relations = await getRelations();
            const first = relations.relations[0];
            relationId = first?.relationId?.toString() ?? null;
          } catch {}
        }

        if (relationId) {
          try {
            await updateChild(relationId, {
              inviteCode: inviteCode.trim(),
              name: childName.trim(),
              birthday: birthday.trim(),
            });
          } catch {}
        }

        Alert.alert(
          '연결 완료 🎉',
          '성장이와 연결되었어요!\n이제 스티커판을 만들고 미션을 시작해보세요.',
          [{ text: '시작하기', onPress: routeToTodagiHome }]
        );
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isLoading || step === 0) return;
    if (step === 4) {
      setChildName('');
      setBirthday('');
    }
    setStep((s) => s - 1);
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <RoleSelectStep
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
        />
      );
    }

    if (step === 1) {
      return isGrowth ? (
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
      );
    }

    if (step === 2) {
      return isGrowth ? (
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
      );
    }

    if (step === 3) {
      return (
        <InviteCodeStep
          title={'초대코드를 입력해주세요'}
          value={inviteCode}
          onChangeText={setInviteCode}
        />
      );
    }

    return (
      <ChildInfoStep
        title={'처음 함께할 성장이를\n등록해주세요.'}
        childName={childName}
        birthday={birthday}
        onChangeChildName={setChildName}
        onPressBirthday={() => setBirthdayModalVisible(true)}
      />
    );
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
        {renderStep()}
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
