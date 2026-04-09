import { Button } from '@/components/common/Button';
import { Text } from '@/components/ui/Text';

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
      <Text style={styles.missionManageTip}>
        Tip. 미션은 토닥이가 미션 달성 스티커를 지급하는 순간 사라져요.{'\n'}
        완료 처리 흐름을 고려해서 조건을 설정해주세요.
      </Text>
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
      <Button
        title="미션 추가"
        onPress={onAddMission}
        size="md"
        variant="soft"
        style={styles.addMissionButton}
      />
    </Section>
  );
}
