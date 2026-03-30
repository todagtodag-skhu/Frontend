import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        variant === 'primary' ? styles.primaryContainer : styles.secondaryContainer,
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryContainer: {
    backgroundColor: colors.primary[900],
  },
  secondaryContainer: {
    backgroundColor: colors.grayscale[100],
  },
  text: {
    color: colors.grayscale[1000],
    fontSize: 24,
  },
});
