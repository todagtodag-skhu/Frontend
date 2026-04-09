import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';

interface CompletedStickerCardProps {
  date: string;          // e.g. '2025.01'
  title: string;         // e.g. '유진이의 스티커 판'
  filled: number;        // e.g. 30
  total: number;         // e.g. 30
  onReview?: () => void;
}

const CompletedStickerCard: React.FC<CompletedStickerCardProps> = ({
  date,
  title,
  filled,
  total,
  onReview,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{date}</Text>
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      </View>

      <View style={styles.centerArea}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>스티커 {filled}/{total} 채움</Text>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.reviewButton} onPress={onReview} activeOpacity={0.7}>
        <Ionicons name="eye" size={16} color={colors.primary[1000]} style={styles.reviewIcon} />
        <Text style={styles.reviewText}>다시보기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CompletedStickerCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.grayscale[100],
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 34,
  },
  date: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: '#797979',
  },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#64CB60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  centerArea: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 21,
    fontFamily: fontFamily.bold,
    color: '#404040',
    marginBottom: 4,
  },
  subtitle: {
    color: '#A7B9D9',
    fontSize: 15,
    fontFamily: fontFamily.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E1D8',
    marginBottom: 16,
  },
  reviewButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  reviewIcon: {
    fontSize: 15,
    paddingTop: 1,
  },
  reviewText: {
    fontSize: 16,
    color: colors.primary[1000],
    fontFamily: fontFamily.bold,
  },
});
