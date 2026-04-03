import { Pressable, View } from 'react-native';

import { Mission } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';

import { childrenStyles as styles } from './styles';

type MissionAssignmentListProps = {
  missions: Mission[];
  onPressMission: (mission: Mission) => void;
  emptyText: string;
};

export function MissionAssignmentList({
  missions,
  onPressMission,
  emptyText,
}: MissionAssignmentListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>성장이에게 부여된 미션</Text>
      {missions.length ? (
        <View style={styles.missionList}>
          {missions.map((mission) => (
            <Pressable
              key={mission.id}
              style={styles.missionCard}
              onPress={() => onPressMission(mission)}
            >
              <Text style={styles.missionEmoji}>{mission.emoji}</Text>
              <View style={styles.missionCopy}>
                <Text weight="bold" style={styles.missionTitle}>
                  {mission.title}
                </Text>
                <Text style={styles.missionMeta}>{mission.frequency} / 스티커 1개</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      )}
    </View>
  );
}
