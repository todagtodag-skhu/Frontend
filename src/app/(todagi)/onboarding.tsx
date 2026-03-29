import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, SafeAreaView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { CalendarModal } from '@/components/todagi/CalendarModal';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { useGrowth } from '@/contexts/GrowthContext';

const SURFACE_RADIUS = 9;

export default function TodagiOnboardingScreen() {
  const router = useRouter();
  const { addChild } = useGrowth();
  const [step, setStep] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [childName, setChildName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);

  const handleNext = () => {
    if (step === 0) {
      if (!inviteCode.trim()) {
        Alert.alert('알림', '초대코드를 입력해주세요.');
        return;
      }

      setStep(1);
      return;
    }

    if (step === 1) {
      if (!childName.trim() || !birthday.trim()) {
        Alert.alert('알림', '이름과 생일을 모두 입력해주세요.');
        return;
      }
    }

    const childId = addChild({
      inviteCode: inviteCode.trim(),
      name: childName.trim(),
      birthday: birthday.trim(),
    });

    router.replace({
      pathname: '/children',
      params: { focusChildId: childId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressRow}>
          {[0, 1].map((progressStep) => (
            <View
              key={progressStep}
              style={[
                styles.progressDot,
                progressStep === step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {step === 0 && (
          <>
            <Text weight="bold" style={styles.title}>
              초대코드를 입력해주세요
            </Text>
            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="초대코드 입력"
              style={styles.codeInput}
            />
          </>
        )}

        {step === 1 && (
          <>
            <Text weight="bold" style={styles.title}>
              성장이 정보를{'\n'}기록해주세요.
            </Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>성장이 이름 (최대 5자)</Text>
                <TextInput
                  value={childName}
                  onChangeText={setChildName}
                  placeholder="성장이 이름"
                  style={styles.fieldInput}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>성장이 생일</Text>
                <Pressable
                  style={[styles.dateField, !birthday && styles.dateFieldEmpty]}
                  onPress={() => setBirthdayModalVisible(true)}
                >
                  <Text style={[styles.dateFieldText, !birthday && styles.dateFieldPlaceholder]}>
                    {birthday || '생년월일을 선택해주세요'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        <Button title="확인" onPress={handleNext} style={styles.confirmButton} />
      </View>

      <CalendarModal
        visible={birthdayModalVisible}
        value={birthday}
        title="생일 선택"
        onConfirm={setBirthday}
        onClose={() => setBirthdayModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  codeInput: {
    width: '100%',
    borderRadius: SURFACE_RADIUS,
    backgroundColor: colors.grayscale[100],
    paddingVertical: 20,
    fontSize: 28,
    letterSpacing: 8,
    marginBottom: 36,
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
    borderRadius: SURFACE_RADIUS,
    backgroundColor: colors.grayscale[100],
    paddingVertical: 18,
    color: '#8D8D8D',
  },
  dateField: {
    borderRadius: SURFACE_RADIUS,
    backgroundColor: colors.grayscale[100],
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dateFieldEmpty: {
    backgroundColor: colors.grayscale[100],
  },
  dateFieldText: {
    fontSize: 24,
    color: colors.grayscale[1000],
  },
  dateFieldPlaceholder: {
    color: colors.grayscale[400],
  },
  confirmButton: {
    flex: 0,
    width: '100%',
    marginTop: 'auto',
    marginBottom: 64,
    paddingVertical: 16,
    borderRadius: SURFACE_RADIUS,
    backgroundColor: '#FFD89A',
  },
});
