import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

interface MissionCardProps {
  title: string;
  frequency: string;   // e.g. '주 1회'
  reward: string;      // e.g. '스티커 1개'
  isHeartFilled?: boolean;
  onHeartPress?: () => void;
  onManagePress?: () => void;
}

const MissionCard: React.FC<MissionCardProps> = ({
  title,
  frequency,
  reward,
  isHeartFilled = false,
  onHeartPress,
  onManagePress,
}) => {
  return (
    <View style={styles.card}>
      {/* 왼쪽 하트 */}
      <TouchableOpacity style={styles.heartButton} onPress={onHeartPress} activeOpacity={0.7}>
        <Ionicons
          name={isHeartFilled ? 'heart' : 'heart-outline'}
          size={24}
          color="red"
          style={styles.leftEmoji}
        />
      </TouchableOpacity>

      {/* 텍스트 영역 */}
      <View style={styles.textArea}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle}>
          {frequency} / {reward}
        </Text>
      </View>

      <TouchableOpacity style={styles.heartButton} onPress={onManagePress} activeOpacity={0.7}>
        <MaterialIcons name="keyboard-double-arrow-right" size={27} color={colors.grayscale[700]} />
      </TouchableOpacity>
    </View>
  );
};

export default MissionCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
    // 그림자 (iOS)
    shadowColor: colors.grayscale[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    // 그림자 (Android)
    elevation: 2,
    borderColor: colors.grayscale[300],
    borderWidth: 1,
  },
  leftEmoji: {
    marginRight: 12,
  },
  textArea: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: colors.grayscale[900],
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.grayscale[700],
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.grayscale[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  heartButtonEmoji: {
    marginTop: 1,
    marginLeft: 13,
  },
});
