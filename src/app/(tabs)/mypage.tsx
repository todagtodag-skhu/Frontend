import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { AppScreen } from '@/components/layout/AppScreen';
import { Section } from '@/components/todagi/Section';
import { todagiStyles } from '@/components/todagi/styles';
import { Text } from '@/components/ui/Text';
import * as authApi from '@/features/auth/api';

const settingsItems = [
  '이용약관 및 개인정보활용동의 열람',
  '완료한 스티커판 열람',
  '회원 탈퇴하기',
];

export default function MyPageScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogout = async () => {
    if (isProcessing) return;
    Alert.alert('로그아웃', '로그아웃을 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          try {
            setIsProcessing(true);
            await authApi.logout();
            router.replace('/login');
          } catch (error) {
            Alert.alert('오류', error instanceof Error ? error.message : '로그아웃에 실패했습니다.');
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  const confirmWithdraw = () => {
    if (isProcessing) return;
    Alert.alert('회원 탈퇴', '회원탈퇴를 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsProcessing(true);
            await authApi.withdraw();
            router.replace('/login');
          } catch (error) {
            Alert.alert('오류', error instanceof Error ? error.message : '회원 탈퇴에 실패했습니다.');
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  return (
    <AppScreen bodyStyle={todagiStyles.scrollView} contentContainerStyle={styles.scrollView}>
        <Section title="일반 설정">
          <View style={styles.list}>
            {settingsItems.map((item) => (
              <Pressable
                key={item}
                style={todagiStyles.card}
                onPress={() =>
                  item === '회원 탈퇴하기'
                    ? confirmWithdraw()
                    : Alert.alert('준비 중', `${item} 기능은 아직 연결되지 않았습니다.`)
                }
              >
                <Text weight="bold" style={styles.itemText}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Button
          title="로그아웃"
          onPress={handleLogout}
          style={styles.logoutButton}
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
  logoutButton: {
    width: '100%',
    marginTop: 0,
  },
});
