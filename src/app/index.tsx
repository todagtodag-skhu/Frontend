import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text weight="bold" style={styles.title}>
        온보딩
      </Text>
      <Button
        title="토닥이"
        onPress={() => router.push('/onboarding')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.primary[700],
  },
  title: {
    fontSize: 28,
    lineHeight: 38,
    color: colors.grayscale[1000],
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    flex: 0,
    minWidth: 220,
  },
});