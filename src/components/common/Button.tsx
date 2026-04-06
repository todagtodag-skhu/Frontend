import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { borderWidth } from '@/constants/borders';
import { colors } from '@/constants/colors';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'soft'
  | 'chip'
  | 'chipDanger'
  | 'danger';

type ButtonSize = 'lg' | 'md' | 'sm' | 'icon';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  style,
  textStyle,
  disabled = false,
  ...pressableProps
}: ButtonProps) {
  return (
    <Pressable
      {...pressableProps}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        sizeStyles[size],
        variantStyles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        weight={size === 'sm' ? 'medium' : 'bold'}
        style={[styles.text, textSizeStyles[size], textVariantStyles[variant], textStyle]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  text: {
    letterSpacing: -0.2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary[900],
    borderWidth: borderWidth.hairline,
    borderColor: '#FFD28A',
  },
  secondary: {
    backgroundColor: colors.grayscale[100],
    borderWidth: borderWidth.hairline,
    borderColor: '#E7DED0',
  },
  soft: {
    backgroundColor: colors.primary[800],
    borderWidth: borderWidth.hairline,
    borderColor: '#F0E3C6',
  },
  chip: {
    backgroundColor: '#FFF3DA',
    borderWidth: borderWidth.strong,
    borderColor: '#FFCF7D',
  },
  chipDanger: {
    backgroundColor: '#FDE8E8',
    borderWidth: borderWidth.strong,
    borderColor: '#F4B8B8',
  },
  danger: {
    backgroundColor: '#FDE8E8',
    borderWidth: borderWidth.hairline,
    borderColor: '#F2C6C6',
  },
});

const sizeStyles = StyleSheet.create({
  lg: {
    minHeight: 56,
    paddingVertical: 14,
  },
  md: {
    minHeight: 48,
    paddingVertical: 12,
  },
  sm: {
    flex: 0,
    minHeight: 40,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  icon: {
    flex: 0,
    minHeight: 56,
    paddingVertical: 14,
    borderStyle: 'dashed',
  },
});

const textSizeStyles = StyleSheet.create({
  lg: {
    color: colors.grayscale[1000],
    fontSize: 24,
  },
  md: {
    color: colors.grayscale[1000],
    fontSize: 18,
  },
  sm: {
    color: colors.grayscale[1000],
    fontSize: 14,
  },
  icon: {
    color: colors.grayscale[1000],
    fontSize: 18,
  },
});

const textVariantStyles = StyleSheet.create({
  primary: {
    color: colors.grayscale[1000],
  },
  secondary: {
    color: colors.grayscale[1000],
  },
  soft: {
    color: colors.grayscale[1000],
  },
  chip: {
    color: '#8B5E1A',
  },
  chipDanger: {
    color: '#B54747',
  },
  danger: {
    color: '#9F3030',
  },
});
