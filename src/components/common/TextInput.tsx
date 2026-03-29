import { StyleSheet, StyleProp, TextStyle } from "react-native";

import { TextInput as BaseTextInput } from "@/components/ui/TextInput";
import { colors } from "@/constants/colors";

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<TextStyle>;
}

export function TextInput({ value, onChangeText, placeholder, style }: TextInputProps) {
  return (
    <BaseTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.grayscale[400]}
      style={[styles.container, style]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
    backgroundColor: colors.grayscale[100],
    borderRadius: 9,
    fontSize: 24,
    color: colors.grayscale[1000],
  }
});