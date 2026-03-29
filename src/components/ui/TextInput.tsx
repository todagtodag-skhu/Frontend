import {
  StyleProp,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
  TextStyle,
} from 'react-native';

import { fontFamily } from '@/constants/fonts';

export function TextInput({
  style,
  ...props
}: TextInputProps) {
  return (
    <RNTextInput
      {...props}
      style={[styles.base, style as StyleProp<TextStyle>]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontFamily.regular,
  },
});
