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
import { getRelations, updateSungjangInfo } from '@/features/relation/api';

/**
 * 온보딩 스텝 구조
 *
 * 성장이 (3 steps)
 *   0: 역할 선택
 *   1: 성장이 소개
 *   2: 초대코드 공유 + 연결 확인
 *
 * 토닥이 (5 steps)
 *   0: 역할 선택
 *   1: 토닥이 소개
 *   2: 보상체계 소개
 *   3: 초대코드 입력 + 연결  ← 연결 성공 후 step 4로 이동
 *   4: 성장이 이름 / 생년월일 입력
 */

export default function OnboardingScreen() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<'todagi' | 'growth' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 토닥이 step 3 연결 후 저장되는 relationId
  const [connectedRelationId, setConnectedRelationId] = useState<string | null>(null);

  // 토닥이 step 4: 성장이 정보
  const [childName, setChildName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);

  const isTodagi = selectedRole === 'todagi';
  const isGrowth = selectedRole === 'growth';

  // 성장이 3 steps / 토닥이 5 steps
  const totalSteps = isGrowth ? 3 : 5;

  const confirmLabel =
    (isGrowth && step === 2)
      ? '연결 확인하기'
      : (isTodagi && step === 4)
      ? '시작하기'
      : '다음';

  // ─── 이동 ─────────────────────────────────────────────────────────────────

  const routeToGrowthHome = () => router.replace('/(growth)/tree');
  const routeToTodagiHome = () => router.replace('/(tabs)/children');

  // ─── 초대코드 공유 (성장이) ────────────────────────────────────────────────

  const handleShareInviteCode = async () => {
    if (!inviteCode) return;
    await Share.share({
      message: `내 초대코드는 ${inviteCode} 이야. 토닥이 앱에서 이 코드를 입력해 연결해줘.`,
    });
  };

  // ─── 다음 / 확인 버튼 ──────────────────────────────────────────────────────

  const handleConfirm = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // ── step 0: 역할 선택 ────────────────────────────────────────────────
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

      // ── step 1: 역할 소개 ────────────────────────────────────────────────
      if (step === 1) {
        setStep(2);
        return;
      }

      // ── step 2 ───────────────────────────────────────────────────────────
      if (step === 2) {
        if (isGrowth) {
          // 성장이: 토닥이 연결 여부 서버 확인
          try {
            await authApi.refreshAccessToken();
            const session = await getAuthSession();

            if (session?.role === 'SUNGJANG') {
              Alert.alert(
                '연결 완료 🎉',
                '토닥이와 연결되었어요!\n이제 미션을 시작해보세요.',
                [{ text: '시작하기', onPress: routeToGrowthHome }]
              );
            } else {
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

        // 토닥이: 보상체계 소개 → 초대코드 입력
        setStep(3);
        return;
      }

      // ── step 3: 토닥이 초대코드 입력 + 연결 ─────────────────────────────
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

          // 연결된 relationId 조회 (성장이 정보 입력에 필요)
          try {
            const relations = await getRelations();
            const first = relations.relations[0];
            if (first?.relationId) {
              setConnectedRelationId(first.relationId.toString());
            }
          } catch {
            // relationId를 못 가져와도 step 4로 진행 (step 4에서 재시도)
          }

          setStep(4);
        } catch (error) {
          Alert.alert(
            '연결 실패',
            error instanceof Error ? error.message : '초대코드 연결에 실패했습니다.'
          );
        }
        return;
      }

      // ── step 4: 토닥이 성장이 이름/생일 입력 ────────────────────────────
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

        // step 3에서 못 가져온 경우 재시도
        if (!relationId) {
          try {
            const relations = await getRelations();
            const first = relations.relations[0];
            relationId = first?.relationId?.toString() ?? null;
          } catch {
            // 무시하고 진행
          }
        }

        if (relationId) {
          try {
            await updateSungjangInfo(relationId, {
              sungjangName: childName.trim(),
              sungjangBirthday: birthday.trim(),
            });
          } catch {
            // 정보 업데이트 실패해도 온보딩은 완료 처리 (앱 내에서 수정 가능)
          }
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

  // ─── 이전 버튼 ─────────────────────────────────────────────────────────────

  const handleBack = () => {
    if (isLoading || step === 0) return;
    // step 4 → step 3으로 돌아갈 때 이름/생일 초기화
    if (step === 4) {
      setChildName('');
      setBirthday('');
    }
    setStep((s) => s - 1);
  };

  // ─── 렌더 ──────────────────────────────────────────────────────────────────

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

    // step 4
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
