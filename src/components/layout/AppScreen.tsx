import { ReactNode } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '@/constants/colors';

type AppScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
};

export function AppScreen({
  children,
  footer,
  scroll = true,
  contentContainerStyle,
  bodyStyle,
}: AppScreenProps) {
  const content = (
    <View style={[styles.content, bodyStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollViewContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary[700],
  },
  scrollViewContent: {
    paddingBottom: 36,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 32,
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    backgroundColor: colors.primary[700],
  },
});
