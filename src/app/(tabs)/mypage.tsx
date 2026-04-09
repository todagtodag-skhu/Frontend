import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

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
            onPress={() => Alert.alert('준비 중', '이용약관 기능은 아직 연결되지 않았습니다.')}
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
});
