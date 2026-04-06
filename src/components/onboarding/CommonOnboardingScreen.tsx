import { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { borderWidth } from '@/constants/borders';
import { colors } from '@/constants/colors';

type CommonOnboardingScreenProps = {
  children: ReactNode;
  onBack?: () => void;
  confirmLabel?: string;
  onConfirm: () => void;
  step: number;
  totalSteps: number;
};

export function CommonOnboardingScreen({
  children,
  onBack,
  confirmLabel = '확인',
  onConfirm,
  step,
  totalSteps,
}: CommonOnboardingScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {children}

        <View style={styles.buttonRow}>
          {(step > 0 && onBack) &&(
            <Button
              title="이전"
              onPress={onBack}
              variant="secondary"
            />
          )}
          <Button
            title={confirmLabel}
            onPress={onConfirm}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export const onboardingStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9EE',
  },
  container: {
    flex: 1,
    paddingHorizontal: 36,
    paddingTop: 80,
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 54,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E4E1DA',
  },
  progressDotActive: {
    backgroundColor: '#FFD89A',
  },
  title: {
    fontSize: 28,
    lineHeight: 42,
    textAlign: 'center',
    color: colors.grayscale[1000],
    marginBottom: 48,
  },
  infoDescription: {
    width: '100%',
    fontSize: 20,
    lineHeight: 34,
    textAlign: 'center',
    color: colors.grayscale[800],
  },
  codeInput: {
    width: '100%',
    borderRadius: 9,
    backgroundColor: colors.grayscale[100],
    paddingVertical: 20,
    fontSize: 28,
    letterSpacing: 8,
    marginBottom: 36,
  },
  roleList: {
    width: '100%',
    gap: 14,
  },
  roleCard: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.grayscale[100],
    borderWidth: borderWidth.emphasis,
    borderColor: '#F1E6D3',
    gap: 6,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleTextGroup: {
    flex: 1,
    gap: 6,
  },
  roleCardSelected: {
    backgroundColor: '#FFF1D4',
    borderColor: '#FFD89A',
  },
  roleTitle: {
    fontSize: 28,
    color: colors.grayscale[1000],
  },
  roleDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.grayscale[700],
  },
  shareCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: colors.grayscale[100],
    borderWidth: borderWidth.emphasis,
    borderColor: '#F1E6D3',
    gap: 8,
    marginBottom: 18,
  },
  shareLabel: {
    fontSize: 15,
    color: colors.grayscale[700],
  },
  shareCode: {
    fontSize: 36,
    letterSpacing: 6,
    color: colors.grayscale[1000],
  },
  shareDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.grayscale[700],
  },
  shareButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    paddingVertical: 16,
    backgroundColor: colors.grayscale[100],
    borderWidth: borderWidth.hairline,
    borderColor: '#F1E6D3',
  },
  shareButtonText: {
    fontSize: 20,
    color: colors.grayscale[1000],
  },
  form: {
    width: '100%',
    gap: 18,
    marginBottom: 48,
  },
  field: {
    gap: 10,
  },
  label: {
    fontSize: 15,
    color: colors.grayscale[1000],
  },
  fieldInput: {
    borderRadius: 9,
    backgroundColor: colors.grayscale[100],
    paddingVertical: 18,
    color: '#8D8D8D',
  },
  dateField: {
    borderRadius: 9,
    backgroundColor: colors.grayscale[100],
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dateFieldText: {
    fontSize: 24,
    color: colors.grayscale[1000],
  },
  dateFieldPlaceholder: {
    color: colors.grayscale[400],
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 64,
  },
  buttonSpacer: {
  },
  button: {
    flex: 1,
    width: '100%',
    borderRadius: 9,
  },
});

const styles = onboardingStyles;
