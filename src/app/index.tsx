import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';
import { Text } from '@/components/ui/Text';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.grayscale[100],
  }
});
