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
  headerLeft?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function AppScreen({
  children,
  title,
  headerLeft,
  footer,
  scroll = true,
  contentContainerStyle,
  bodyStyle,
  titleStyle,
}: AppScreenProps) {
  const renderTitle = () => {
    if (!title) return null;

    if (headerLeft) {
      return (
        <View style={styles.headerRow}>
          <View style={styles.headerSide}>{headerLeft}</View>
          <Text weight="bold" style={[styles.title, titleStyle]}>{title}</Text>
          <View style={styles.headerSide} />
        </View>
      );
    }

    return (
      <Text weight="bold" style={[styles.title, titleStyle]}>{title}</Text>
    );
  };

  const content = (
    <View style={[styles.content, bodyStyle]}>
      {renderTitle()}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  headerSide: {
    width: 60,
  },
  title: {
    flex: 1,
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
