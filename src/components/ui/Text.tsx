import {
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextProps,
  TextStyle,
} from 'react-native';

import { fontFamily } from '@/constants/fonts';

type AppTextProps = TextProps & {
  weight?: keyof typeof fontFamily;
};

export function Text({
  style,
  weight = 'regular',
  ...props
}: AppTextProps) {
  return (
    <RNText
      {...props}
      style={[styles.base, stylesByWeight[weight], style as StyleProp<TextStyle>]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontFamily.regular,
  },
});

const stylesByWeight = StyleSheet.create({
  regular: {
    fontFamily: fontFamily.regular,
  },
  medium: {
    fontFamily: fontFamily.medium,
  },
  bold: {
    fontFamily: fontFamily.bold,
  },
});
