import { ReactNode } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

type AppScreenProps = {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function AppScreen({
  children,
  title,
  footer,
  scroll = true,
  contentContainerStyle,
  bodyStyle,
  titleStyle,
}: AppScreenProps) {
  const content = (
    <View style={[styles.content, bodyStyle]}>
      {title ? (
        <Text weight="bold" style={[styles.title, titleStyle]}>
          {title}
        </Text>
      ) : null}
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
    paddingTop: 48,
    gap: 32,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    color: colors.grayscale[1000],
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    backgroundColor: colors.primary[700],
  },
});
