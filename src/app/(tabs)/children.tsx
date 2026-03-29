import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Section } from '@/components/todagi/Section';
import { todagiStyles } from '@/components/todagi/styles';
import { Text } from '@/components/ui/Text';
import { useGrowth } from '@/contexts/GrowthContext';

export default function ChildrenScreen() {
  const router = useRouter();
  const { focusChildId } = useLocalSearchParams<{ focusChildId?: string }>();
  const { children, getBoardsByChildId } = useGrowth();
  const focusedChild = children.find((child) => child.id === focusChildId);

  return (
    <SafeAreaView style={todagiStyles.safeArea}>
      <ScrollView
        contentContainerStyle={[todagiStyles.scrollView, styles.scrollView]}
        showsVerticalScrollIndicator={false}
      >
        <Text weight="bold" style={todagiStyles.title}>
          성장이 관리
        </Text>

        {focusedChild ? (
          <Section title="방금 연결된 성장이">
            <View style={styles.list}>
              <View style={todagiStyles.card}>
                <Text weight="bold" style={styles.summaryTitle}>
                  {focusedChild.name}
                </Text>
                <Text style={styles.summaryText}>생일 {focusedChild.birthday}</Text>
                <Text style={styles.summaryText}>
                  연결된 스티커판 {getBoardsByChildId(focusedChild.id).length}개
                </Text>
              </View>
              <Button
                title="상세 보기"
                onPress={() =>
                  router.push({
                    pathname: '/child-detail',
                    params: { childId: focusedChild.id },
                  })
                }
                style={styles.addButton}
              />
              <Button
                title="바로 스티커판 만들기"
                onPress={() =>
                  router.push({
                    pathname: '/create-sticker',
                    params: { childId: focusedChild.id },
                  })
                }
                style={styles.addButton}
              />
            </View>
          </Section>
        ) : null}

        <Section title="연동된 성장이">
          <View style={styles.list}>
            {children.map((child) => (
              <Pressable
                key={child.id}
                style={todagiStyles.card}
                onPress={() =>
                  router.push({
                    pathname: '/child-detail',
                    params: { childId: child.id },
                  })
                }
              >
                <Text weight="bold" style={styles.summaryTitle}>
                  {child.name}
                </Text>
                <Text style={styles.summaryText}>
                  연결된 스티커판 {getBoardsByChildId(child.id).length}개
                </Text>
                <Text style={styles.summaryText}>생일 {child.birthday}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Button
          title="새 성장이 연결하기"
          onPress={() => router.push('/onboarding')}
          style={styles.addButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingBottom: 36,
  },
  list: {
    gap: 10,
  },
  summaryTitle: {
    fontSize: 20,
  },
  summaryText: {
    fontSize: 13,
    color: '#888888',
  },
  addButton: {
    width: '100%',
    marginTop: 0,
  },
});
