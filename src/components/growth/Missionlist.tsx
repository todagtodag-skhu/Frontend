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
  frequency: string;
  reward: string;
  isSelected?: boolean;
  onPress?: () => void;
  onManagePress?: () => void;
}

const MissionCard: React.FC<MissionCardProps> = ({
  emoji,
  title,
  frequency,
  reward,
  isSelected = false,
  onPress,
  onManagePress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
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
    </TouchableOpacity>
  );
};

export default MissionCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: colors.grayscale[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderColor: colors.grayscale[300],
    borderWidth: 1,
  },
  cardSelected: {
    backgroundColor: '#FFF1D4',
    borderColor: '#FF954D',
    borderWidth: 1.5,
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
