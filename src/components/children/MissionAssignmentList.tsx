import { View } from 'react-native';

import { Mission } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';

import { childrenStyles as styles } from './styles';

type MissionAssignmentListProps = {
  missions: Mission[];
  emptyText: string;
};

export function MissionAssignmentList({
  missions,
  emptyText,
}: MissionAssignmentListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>성장이에게 부여된 미션</Text>
      {missions.length ? (
        <View style={styles.missionList}>
          {missions.map((mission) => (
            <View
              key={mission.id}
              style={styles.missionCard}
            >
              <Text style={styles.missionEmoji}>{mission.emoji}</Text>
              <View style={styles.missionCopy}>
                <Text weight="bold" style={styles.missionTitle}>
                  {mission.title}
                </Text>
                <Text style={styles.missionMeta}>{mission.frequency} / 스티커 1개</Text>
              </View>
            </View>
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
