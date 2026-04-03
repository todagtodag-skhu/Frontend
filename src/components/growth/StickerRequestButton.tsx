import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Pressable, View } from 'react-native';
import { fontFamily } from '@/constants/fonts';

interface StickerRequestButtonProps {
  onPress?: () => void;
  onClose?: () => void;
}

export const StickerRequestButton = ({ onPress, onClose }: StickerRequestButtonProps) => {
  const handlePress =
    onPress ??
    (() => Alert.alert('스티커 요청!', '부모님께 미션 완료 알림을 보냈어요!'));

  return (
    <View style={styles.card}>
        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
        <Text style={styles.closeButtonText}>x</Text>
      </Pressable>
      <TouchableOpacity
        style={styles.requestButton}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Text style={styles.requestButtonText}>스티커 조르기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 14,
    paddingRight: 16,
    paddingBottom: 30,
    paddingLeft: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  closeButtonText: {
    fontSize: 30,
    lineHeight: 20,
    color: '#8F7B63',
    fontFamily: fontFamily.bold,
  },
  requestButton: {
    backgroundColor: '#E7DDCD',
    borderRadius: 16,
    paddingHorizontal: 2,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#D7C9B2',
    alignItems: 'center',
  },
  requestButtonText: {
    fontSize: 21,
    color: '#6C523C',
    fontFamily: fontFamily.bold,
  },
});
