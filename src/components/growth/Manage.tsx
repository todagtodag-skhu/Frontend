import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily } from '@/constants/fonts';

type ManageProps = {
  missionContent: string;
  frequency: string;
  onClose: () => void;
  onEdit?: () => void;
};

export default function Manage({ onClose, onEdit }: ManageProps) {
  return (
    <View style={styles.card}>
      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={onEdit ?? onClose} hitSlop={8}>
          <Text style={styles.actionButtonText}>스티커 조르기</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={onClose} hitSlop={8}>
          <Text style={styles.actionButtonText}>닫기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingTop: 24,
    paddingRight: 24,
    paddingBottom: 24,
    paddingLeft: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 88,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F2EA',
  },
  actionButtonText: {
    fontSize: 15,
    color: '#8F7B63',
    fontFamily: fontFamily.bold,
  },
});
