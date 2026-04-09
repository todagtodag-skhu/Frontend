import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppModal } from '@/components/common/AppModal';
import { Button } from '@/components/common/Button';
import { AppScreen } from '@/components/layout/AppScreen';
import { Section } from '@/components/todagi/Section';
import { todagiStyles } from '@/components/todagi/styles';
import { Text } from '@/components/ui/Text';
import { useLogout, useWithdraw } from '@/features/auth/hooks';

export default function MyPageScreen() {
  const router = useRouter();
  const logout = useLogout();
  const withdraw = useWithdraw();
  const [termsVisible, setTermsVisible] = useState(false);
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: () => {
          logout.mutate(undefined, {
            onSuccess: () => router.replace('/login'),
            onError: () => {
              // 서버 오류여도 로컬 세션 초기화 후 이동 (onSettled에서 처리)
              router.replace('/login');
            },
          });
        },
      },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert(
      '회원 탈퇴',
      '탈퇴하면 연결된 모든 성장이 계정과 데이터가 삭제됩니다.\n정말 탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: () => {
            withdraw.mutate(undefined, {
              onSuccess: () => router.replace('/login'),
              onError: () => Alert.alert('오류', '회원 탈퇴에 실패했습니다. 다시 시도해주세요.'),
            });
          },
        },
      ],
    );
  };

  return (
    <AppScreen bodyStyle={todagiStyles.scrollView} contentContainerStyle={styles.scrollView}>
      <Section title="일반 설정">
        <View style={styles.list}>
          <Pressable
            style={todagiStyles.card}
            onPress={() => setTermsVisible(true)}
          >
            <Text weight="bold" style={styles.itemText}>
              이용약관 및 개인정보활용동의 열람
            </Text>
          </Pressable>

          <Pressable
            style={todagiStyles.card}
            onPress={() => Alert.alert('준비 중', '완료한 스티커판 기능은 아직 연결되지 않았습니다.')}
          >
            <Text weight="bold" style={styles.itemText}>
              완료한 스티커판 열람
            </Text>
          </Pressable>

          <Pressable
            style={todagiStyles.card}
            onPress={handleWithdraw}
            disabled={withdraw.isPending}
          >
            <Text weight="bold" style={[styles.itemText, styles.withdrawText]}>
              회원 탈퇴하기
            </Text>
          </Pressable>
        </View>
      </Section>

      <Button
        title={logout.isPending ? '로그아웃 중...' : '로그아웃'}
        onPress={handleLogout}
        style={styles.logoutButton}
        disabled={logout.isPending}
      />

      <AppModal
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
        title="토닥토닥 이용약관"
        contentStyle={styles.termsModal}
        bodyStyle={styles.termsBody}
        footer={
          <Button
            title="닫기"
            onPress={() => setTermsVisible(false)}
            size="sm"
            variant="chip"
            style={styles.termsButton}
          />
        }
      >
        <ScrollView
          style={styles.termsScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.termsScroll}
        >
          <Text style={styles.termsParagraph}>제1조 목적</Text>
          <Text style={styles.termsText}>
            이 약관은 토닥토닥 서비스의 이용 조건과 운영 기준, 이용자와 운영자의 권리와 책임을 정하는 것을 목적으로 합니다.
          </Text>

          <Text style={styles.termsParagraph}>제2조 서비스 내용</Text>
          <Text style={styles.termsText}>
            토닥토닥은 아동의 습관 형성을 돕기 위해 목표 설정, 수행 기록, 보상 확인 등의 기능을 제공하는 서비스입니다.
          </Text>

          <Text style={styles.termsParagraph}>제3조 이용자</Text>
          <Text style={styles.termsText}>
            서비스는 회원가입 또는 로그인 후 이용할 수 있으며, 이용자는 정확한 정보를 제공해야 합니다.
          </Text>

          <Text style={styles.termsParagraph}>제4조 이용자의 책임</Text>
          <Text style={styles.termsText}>
            이용자는 서비스를 법령과 공공질서에 맞게 이용해야 하며, 다음 행위를 해서는 안 됩니다.
          </Text>
          <Text style={styles.termsText}>타인의 정보를 도용하는 행위</Text>
          <Text style={styles.termsText}>서비스 운영을 방해하는 행위</Text>
          <Text style={styles.termsText}>허위 정보를 등록하는 행위</Text>
          <Text style={styles.termsText}>법령 또는 사회질서에 반하는 행위</Text>

          <Text style={styles.termsParagraph}>제5조 서비스 제공 및 변경</Text>
          <Text style={styles.termsText}>
            운영자는 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다. 다만 중요한 변경이 있는 경우 사전에 안내합니다.
          </Text>

          <Text style={styles.termsParagraph}>제6조 개인정보</Text>
          <Text style={styles.termsText}>
            운영자는 서비스 제공에 필요한 범위에서 이용자의 정보를 수집·이용하며, 관련 내용은 개인정보처리방침에 따릅니다.
          </Text>

          <Text style={styles.termsParagraph}>제7조 책임의 제한</Text>
          <Text style={styles.termsText}>
            운영자는 천재지변, 시스템 장애, 이용자의 귀책사유로 발생한 손해에 대해서 책임을 지지 않습니다.
          </Text>

          <Text style={styles.termsParagraph}>제8조 약관의 변경</Text>
          <Text style={styles.termsText}>
            운영자는 필요한 경우 약관을 변경할 수 있으며, 변경 시 서비스 내 공지합니다.
          </Text>

          <Text style={styles.termsParagraph}>제9조 문의</Text>
          <Text style={styles.termsText}>
            서비스 이용 중 문의사항이 있는 경우 운영자에게 문의할 수 있습니다.
          </Text>

          <Text style={styles.termsParagraph}>부칙</Text>
          <Text style={styles.termsText}>
            본 약관은 2026년 4월 9일부터 적용됩니다.
          </Text>
        </ScrollView>
      </AppModal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingBottom: 36,
  },
  list: {
    gap: 10,
  },
  itemText: {
    fontSize: 22,
    textAlign: 'center',
  },
  withdrawText: {
    color: '#B54747',
  },
  logoutButton: {
    width: '100%',
    marginTop: 0,
  },
  termsModal: {
    width: '88%',
    maxHeight: '82%',
  },
  termsBody: {
    gap: 0,
    minHeight: 0,
    flexShrink: 1,
  },
  termsScrollView: {
    minHeight: 0,
    flexShrink: 1,
  },
  termsScroll: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  termsParagraph: {
    fontSize: 16,
    lineHeight: 24,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  termsButton: {
    width: '100%',
    marginTop: 0,
  },
});
