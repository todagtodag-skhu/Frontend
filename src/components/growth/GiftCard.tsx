import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '@/constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fontFamily } from '@/constants/fonts';

interface GiftCardProps {
  label: string;       // e.g. '베스킨라빈스'
  status: string;      // e.g. '열기전'
  isUnlocked: boolean; // true = 주황색 활성 / false = 베이지 비활성
  onPress?: () => void;
}

const GiftCard: React.FC<GiftCardProps> = ({
  label,
  status,
  isUnlocked,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isUnlocked ? styles.cardUnlocked : styles.cardLocked]}
      onPress={isUnlocked ? onPress : undefined}
      activeOpacity={isUnlocked ? 0.8 : 1}
    >
      {/* 아이콘 */}
      <Ionicons
        name={isUnlocked ? 'gift' : 'image'}
        size={36}
        color={isUnlocked ? colors.grayscale[100] : '#D4A96A'}
        style={[styles.icon, !isUnlocked && styles.iconLocked]}
      />

      {/* 레이블 */}
      <Text style={[styles.label, !isUnlocked && styles.textLocked]}>
        {label}
      </Text>

      {/* 상태 텍스트 */}
      <Text style={[styles.status, !isUnlocked && styles.textLocked]}>
        {status}
      </Text>
    </TouchableOpacity>
  );
};

export default GiftCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    padding: 16,
  },
  cardUnlocked: {
    backgroundColor: colors.primary[1000],
  },
  cardLocked: {
    backgroundColor: colors.primary[800],
  },
  icon: {
    marginBottom: 4,
  },
  iconLocked: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.grayscale[100],
  },
  status: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: colors.grayscale[100],
  },
  textLocked: {
    color: '#D4A96A',
  },
});
