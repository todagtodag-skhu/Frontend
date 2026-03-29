import { Pressable, StyleSheet, StyleProp, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, style }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.primary[900],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  text: {
    color: colors.grayscale[1000],
    fontSize: 24,
  }
});