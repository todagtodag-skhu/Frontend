import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

import AppleLogo from '../../../assets/apple.svg';
import BgBottom from '../../../assets/bg.svg';
import Dogs from '../../../assets/bgDogs.svg';

const LOGIN_COPY = {
  title: '토닥토닥',
  description: '더 나은 성장을 위한 동행',
  agreement: '로그인하면 서비스 이용약관에 동의하게 됩니다.',
  submitting: '로그인 중...',
  cta: 'Apple로 로그인',
} as const;

type LoginScreenProps = {
  isSubmitting: boolean;
  onAppleLogin: () => Promise<void>;
};

export function LoginScreen({
  isSubmitting,
  onAppleLogin,
}: LoginScreenProps) {
  return (
    <View style={styles.screen}>
      <BackgroundArtwork />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <HeroSection />
          <View style={styles.spacer} />
          <LoginFooter
            isSubmitting={isSubmitting}
            onAppleLogin={onAppleLogin}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function BackgroundArtwork() {
  return (
    <>
      <View style={[styles.orb, styles.orbLarge]} />
      <View style={[styles.orb, styles.orbSmall]} />
      <BgBottom width="100%" style={styles.bgBottom} />
      <Dogs width="100%" style={styles.dogs} />
    </>
  );
}

function HeroSection() {
  return (
    <View style={styles.hero}>
      <Text weight="bold" style={styles.title}>
        {LOGIN_COPY.title}
      </Text>
      <Text style={styles.description}>
        {LOGIN_COPY.description}
      </Text>
    </View>
  );
}

type LoginFooterProps = {
  isSubmitting: boolean;
  onAppleLogin: () => Promise<void>;
};

function LoginFooter({ isSubmitting, onAppleLogin }: LoginFooterProps) {
  return (
    <View style={styles.footer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={LOGIN_COPY.cta}
        onPress={onAppleLogin}
        disabled={isSubmitting}
        style={({ pressed }) => [
          styles.appleButton,
          pressed && styles.appleButtonPressed,
          isSubmitting && styles.appleButtonDisabled,
        ]}
      >
        <AppleLogo width={23} height={23} />
        <Text weight="bold" style={styles.appleButtonText}>
          {isSubmitting ? LOGIN_COPY.submitting : LOGIN_COPY.cta}
        </Text>
      </Pressable>

      <Text style={styles.agreementText}>
        {LOGIN_COPY.agreement}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary[900],
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 140,
    paddingBottom: 40,
  },

  spacer: {
    flex: 0.3,
  },

  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.primary[800],
  },

  orbLarge: {
    top: 100,
    left: 20,
    width: 200,
    height: 200,
    opacity: 0.5,
  },

  orbSmall: {
    top: 320,
    right: 26,
    width: 60,
    height: 60,
    opacity: 0.5,
  },

  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
  },

  dogs: {
    position: 'absolute',
    bottom: 20,
    left: -20,
    width: '100%',
    zIndex: 0,
  },

  hero: {
    alignItems: 'center',
    gap: 6,
  },

  title: {
    fontSize: 44,
    color: colors.grayscale[1000],
  },

  description: {
    fontSize: 20,
    color: colors.grayscale[700],
    textAlign: 'center',
  },

  footer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },

  appleButton: {
    width: '100%',
    maxWidth: 361,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.grayscale[100],
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.08)',
  },

  appleButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  appleButtonText: {
    fontSize: 17,
    textAlign: 'center',
    color: colors.grayscale[1000],
  },

  appleButtonDisabled: {
    opacity: 0.55,
  },

  agreementText: {
    marginTop: 12,
    color: colors.grayscale[500],
    fontSize: 12,
  },
});