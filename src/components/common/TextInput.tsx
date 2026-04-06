import { StyleProp, StyleSheet, TextInputProps, TextStyle } from 'react-native';

import { TextInput as BaseTextInput } from '@/components/ui/TextInput';
import { borderWidth } from '@/constants/borders';
import { colors } from '@/constants/colors';

type TextInputVariant = 'default' | 'soft';
type TextInputSize = 'lg' | 'md' | 'sm';
type TextAlign = 'center' | 'left';

interface AppTextInputProps extends TextInputProps {
  variant?: TextInputVariant;
  size?: TextInputSize;
  align?: TextAlign;
  style?: StyleProp<TextStyle>;
}

export function TextInput({
  style,
  variant = 'default',
  size = 'lg',
  align = 'center',
  placeholderTextColor = colors.grayscale[400],
  ...props
}: AppTextInputProps) {
  return (
    <BaseTextInput
      {...props}
      placeholderTextColor={placeholderTextColor}
      style={[styles.base, variantStyles[variant], sizeStyles[size], alignStyles[align], style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    backgroundColor: colors.grayscale[100],
    borderRadius: 14,
    borderWidth: borderWidth.hairline,
    borderColor: '#ECE3D4',
    color: colors.grayscale[1000],
    letterSpacing: -0.2,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: colors.grayscale[100],
  },
  soft: {
    backgroundColor: colors.primary[700],
  },
});

const sizeStyles = StyleSheet.create({
  lg: {
    paddingVertical: 16,
    fontSize: 24,
  },
  md: {
    paddingVertical: 14,
    fontSize: 18,
  },
  sm: {
    paddingVertical: 12,
    fontSize: 16,
  },
});

const alignStyles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  left: {
    textAlign: 'left',
  },
});
