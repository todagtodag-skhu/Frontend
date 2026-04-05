import { Button } from '@/components/common/Button';

import { MissionEditCard } from './MissionEditCard';
import { Section } from './Section';
import { todagiStyles as styles } from './styles';
import { Mission } from './types';

type MissionInlineEditorSectionProps = {
  missions: Mission[];
  onPressMissionEmoji: (missionId: string) => void;
  onChangeTitle: (missionId: string, title: string) => void;
  onChangeCompletionCount: (missionId: string, count: number) => void;
  onChangeStickerPerCompletion: (missionId: string, count: number) => void;
  onDeleteMission: (missionId: string) => void;
  onAddMission: () => void;
};

export function MissionInlineEditorSection({
  missions,
  onPressMissionEmoji,
  onChangeTitle,
  onChangeCompletionCount,
  onChangeStickerPerCompletion,
  onDeleteMission,
  onAddMission,
}: MissionInlineEditorSectionProps) {
  return (
    <Section title="">
      {missions.map((mission) => (
        <MissionEditCard
          key={mission.id}
          mission={mission}
          onPressEmoji={() => onPressMissionEmoji(mission.id)}
          onChangeTitle={(title) => onChangeTitle(mission.id, title)}
          onChangeCompletionCount={(count) => onChangeCompletionCount(mission.id, count)}
          onChangeStickerPerCompletion={(count) =>
            onChangeStickerPerCompletion(mission.id, count)
          }
          onDelete={() => onDeleteMission(mission.id)}
        />
      ))}
      <Button title="+" onPress={onAddMission} style={styles.addMissionButton} />
    </Section>
  );
}
