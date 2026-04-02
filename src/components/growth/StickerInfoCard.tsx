import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily } from '@/constants/fonts';

type StickerInfoCardProps = {
  missionTitle: string;
  placedAtLabel: string;
  onDelete: () => void;
};

const STICKER_ICON_COLOR = '#FF3B30';
const STICKER_ICON_NAME = 'food-apple';
const STICKER_ICON_SIZE = 44;
const STICKER_ICON_OUTLINE_SIZE = 44;

function StickerIcon() {
  return (
    <View style={styles.stickerIconWrap}>
      <MaterialCommunityIcons
        name={STICKER_ICON_NAME}
        size={STICKER_ICON_OUTLINE_SIZE}
        color="#FFFFFF"
        style={styles.stickerIconOutline}
      />
      <MaterialCommunityIcons
        name={STICKER_ICON_NAME}
        size={STICKER_ICON_SIZE}
        color={STICKER_ICON_COLOR}
      />
    </View>
  );
}

export function StickerInfoCard({
  missionTitle,
  placedAtLabel,
  onDelete,
}: StickerInfoCardProps) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.deleteButton} onPress={onDelete} hitSlop={8}>
        <Text style={styles.deleteButtonText}>삭제</Text>
      </Pressable>

      <View style={styles.iconWrap}>
        <StickerIcon />
      </View>
      <Text style={styles.mission}>{missionTitle}</Text>
      <Text style={styles.date}>{placedAtLabel}</Text>
      <Text style={styles.closeHint}>바깥 영역을 탭해서 닫기</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingTop: 24,
    paddingRight: 28,
    paddingBottom: 28,
    paddingLeft: 28,
    alignItems: 'center',
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F2EA',
  },
  deleteButtonText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#8F7B63',
    fontFamily: fontFamily.bold,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerIconWrap: {
    width: STICKER_ICON_OUTLINE_SIZE,
    height: STICKER_ICON_OUTLINE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerIconOutline: {
    position: 'absolute',
  },
  mission: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  date: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: '#888',
    marginBottom: 14,
  },
  closeHint: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: '#AAA',
  },
});
