import { Pressable } from 'react-native';

import { Button } from '@/components/common/Button';
import { Text } from '@/components/ui/Text';

import { MissionCard } from './MissionCard';
import { MissionFormCard } from './MissionFormCard';
import { Section } from './Section';
import { todagiStyles as styles } from './styles';
import { Mission } from './types';

type MissionBuilderSectionProps = {
  missions: Mission[];
  missionEmoji: string;
  missionTitle: string;
  selectedDays: string[];
  missionFrequency: string;
  editingMissionId: string | null;
  onPressMission: (mission: Mission) => void;
  onLongPressMission: (missionId: string) => void;
  onPressEmojiSelect: () => void;
  onChangeMissionTitle: (value: string) => void;
  onPressDaySelect: () => void;
  onPressFrequencySelect: () => void;
  onSubmitMission: () => void;
  onCancelEdit: () => void;
};

export function MissionBuilderSection({
  missions,
  missionEmoji,
  missionTitle,
  selectedDays,
  missionFrequency,
  editingMissionId,
  onPressMission,
  onLongPressMission,
  onPressEmojiSelect,
  onChangeMissionTitle,
  onPressDaySelect,
  onPressFrequencySelect,
  onSubmitMission,
  onCancelEdit,
}: MissionBuilderSectionProps) {
  return (
    <Section title="미션 항목 추가">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onPress={() => onPressMission(mission)}
          onLongPress={() => onLongPressMission(mission.id)}
        />
      ))}
      <MissionFormCard
        missionEmoji={missionEmoji}
        missionTitle={missionTitle}
        selectedDays={selectedDays}
        missionFrequency={missionFrequency}
        onPressEmojiSelect={onPressEmojiSelect}
        onChangeMissionTitle={onChangeMissionTitle}
        onPressDaySelect={onPressDaySelect}
        onPressFrequencySelect={onPressFrequencySelect}
      />
      {editingMissionId ? (
        <Pressable onPress={onCancelEdit}>
          <Text style={styles.editingCaption}>수정 중인 미션 취소하기</Text>
        </Pressable>
      ) : null}
      <Button
        title={editingMissionId ? '미션 수정하기' : '미션 추가하기'}
        onPress={onSubmitMission}
        size="md"
        variant="soft"
        style={styles.addMissionButton}
      />
    </Section>
  );
}
