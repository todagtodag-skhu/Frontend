import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fontFamily } from '@/constants/fonts';

type StickerRequestButtonProps = {
  missionTitle?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function StickerRequestButton({
  missionTitle = '엄마한테 사랑한다고 말하기',
  onConfirm,
  onCancel,
}: StickerRequestButtonProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.messageText}>
        {missionTitle}
        {'\n'}미션에 대해서
        {'\n'}스티커를 요청할까요?
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onCancel} activeOpacity={0.85}>
          <Text style={styles.actionButtonText}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onConfirm} activeOpacity={0.85}>
          <Text style={styles.actionButtonText}>네</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    fontSize: 24,
    lineHeight: 28,
    color: '#505659',
    fontFamily: fontFamily.bold,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#EFF1F3',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    color: '#111111',
    fontFamily: fontFamily.bold,
  },
});
