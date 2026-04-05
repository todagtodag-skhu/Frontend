import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily } from '@/constants/fonts';

type StickerInfoCardProps = {
  missionEmoji: string;
  missionTitle: string;
  onConfirm: () => void;
};

const STICKER_ICON_OUTLINE_SIZE = 44;

function StickerIcon({ emoji }: { emoji?: string }) {
  return (
    <View style={styles.stickerIconWrap}>
      <View style={styles.iconBackground} />
      {emoji ? <Text style={styles.stickerEmoji}>{emoji}</Text> : null}
    </View>
  );
}

export function StickerInfoCard({
  missionEmoji,
  missionTitle,
  onConfirm,
}: StickerInfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <StickerIcon emoji={missionEmoji} />
      </View>
      <Text style={styles.mission}>{missionTitle}</Text>
      <Pressable style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>확인</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFF2CF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F7D38B',
    paddingTop: 22,
    paddingRight: 16,
    paddingBottom: 14,
    paddingLeft: 16,
    alignItems: 'center',
    position: 'relative',
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerIconWrap: {
    width: STICKER_ICON_OUTLINE_SIZE,
    height: STICKER_ICON_OUTLINE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  stickerEmoji: {
    fontSize: 22,
    lineHeight: 24,
  },
  mission: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.bold,
    color: '#3A2C1B',
    marginBottom: 14,
    textAlign: 'center',
  },
  confirmButton: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#1A1A1A',
  },
});
