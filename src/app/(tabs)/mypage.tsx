import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { AppScreen } from '@/components/layout/AppScreen';
import { Section } from '@/components/todagi/Section';
import { todagiStyles } from '@/components/todagi/styles';
import { Text } from '@/components/ui/Text';

const settingsItems = [
  '이용약관 및 개인정보활용동의 열람',
  '완료한 스티커판 열람',
  '회원 탈퇴하기',
];

export default function MyPageScreen() {
  return (
    <AppScreen bodyStyle={todagiStyles.scrollView} contentContainerStyle={styles.scrollView}>
        <Section title="일반 설정">
          <View style={styles.list}>
            {settingsItems.map((item) => (
              <Pressable
                key={item}
                style={todagiStyles.card}
                onPress={() => Alert.alert('준비 중', `${item} 기능은 아직 연결되지 않았습니다.`)}
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
          onPress={() => Alert.alert('로그아웃', '로그아웃 기능은 아직 연결되지 않았습니다.')}
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
