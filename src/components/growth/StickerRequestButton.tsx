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
    width: '108%',
    backgroundColor: '#E9DFC8',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFD89A',
    paddingTop: 36,
    paddingRight: 22,
    paddingBottom: 16,
    paddingLeft: 22,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 22,
    lineHeight: 26,
    color: '#2B2118',
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 20,
    color: '#111111',
    fontFamily: fontFamily.bold,
  },
});
