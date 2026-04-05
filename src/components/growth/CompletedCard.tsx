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
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.grayscale[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  date: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CD964',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centerArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: colors.grayscale[900],
    marginBottom: 6,
  },
  subtitle: {
    color: colors.grayscale[500],
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 14,
  },
  reviewButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    color: colors.primary[1000],
  },
  reviewIcon: {
    fontSize: 16,
    paddingTop: 2,
  },
  reviewText: {
    fontSize: 15,
    color: colors.primary[1000],
    fontFamily: fontFamily.bold,
  },
});
