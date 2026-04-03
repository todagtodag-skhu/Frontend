import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { fontFamily } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

interface MissionCardProps {
  emoji: string;
  title: string;
  frequency: string;   // e.g. '주 1회'
  reward: string;      // e.g. '스티커 1개'
  onManagePress?: () => void;
}

const MissionCard: React.FC<MissionCardProps> = ({
  emoji,
  title,
  frequency,
  reward,
  onManagePress,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.emojiBox}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </View>

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
  emojiBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.grayscale[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiText: {
    fontSize: 24,
    lineHeight: 28,
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
