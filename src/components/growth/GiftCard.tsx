import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fontFamily } from '@/constants/fonts';

interface GiftCardProps {
  label: string;       // e.g. '베스킨라빈스'
  status: string;      // e.g. '열기전'
  onPress?: () => void;
}

const GiftCard: React.FC<GiftCardProps> = ({
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name="gift"
        size={36}
        color={colors.grayscale[100]}
        style={styles.icon}
      />

      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default GiftCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#FF9B5D',
    paddingHorizontal: 22,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  icon: {
    marginBottom: 0,
  },
  label: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: colors.grayscale[100],
    justifyContent: 'center',
  },
});
