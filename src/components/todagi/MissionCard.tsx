import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { todagiStyles } from './styles';
import { Mission } from './types';

type MissionCardProps = {
  mission: Mission;
  onPress?: () => void;
  onLongPress: () => void;
};

export function MissionCard({ mission, onPress, onLongPress }: MissionCardProps) {
  return (
    <Pressable style={todagiStyles.card} onPress={onPress} onLongPress={onLongPress}>
      <View style={todagiStyles.row}>
        <View style={todagiStyles.emojiBox}>
          <Text style={todagiStyles.emojiText}>{mission.emoji}</Text>
        </View>
        <View style={todagiStyles.missionMeta}>
          <Text style={todagiStyles.missionItemTitle}>{mission.title}</Text>
          <Text style={todagiStyles.missionItemSub}>
            {mission.days} · {mission.frequency}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
