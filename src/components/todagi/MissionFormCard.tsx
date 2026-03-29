import { Pressable, View } from 'react-native';

import { TextInput } from '@/components/common/TextInput';
import { Text } from '@/components/ui/Text';

import { todagiStyles } from './styles';

type MissionFormCardProps = {
  missionEmoji: string;
  missionTitle: string;
  selectedDays: string[];
  missionFrequency: string;
  onPressEmojiSelect: () => void;
  onChangeMissionTitle: (value: string) => void;
  onPressDaySelect: () => void;
  onPressFrequencySelect: () => void;
};

export function MissionFormCard({
  missionEmoji,
  missionTitle,
  selectedDays,
  missionFrequency,
  onPressEmojiSelect,
  onChangeMissionTitle,
  onPressDaySelect,
  onPressFrequencySelect, 
}: MissionFormCardProps) {
  return (
    <View style={todagiStyles.card}>
      <View style={todagiStyles.row}>
        <Pressable
          style={[todagiStyles.emojiBox, todagiStyles.emojiPicker]}
          onPress={onPressEmojiSelect}
        >
          <Text style={todagiStyles.emojiText}>{missionEmoji}</Text>
        </Pressable>
        <TextInput
          placeholder="미션 이름을 입력하세요"
          value={missionTitle}
          onChangeText={onChangeMissionTitle}
          style={todagiStyles.missionInput}
        />
      </View>
      <View style={todagiStyles.row}>
        <Pressable
          style={[todagiStyles.selectBox, todagiStyles.missionDaySelect]}
          onPress={onPressDaySelect}
        >
          <Text
            style={
              selectedDays.length > 0
                ? todagiStyles.selectText
                : todagiStyles.selectPlaceholder
            }
          >
            {selectedDays.length > 0 ? selectedDays.join(',') : '요일 선택'}
          </Text>
        </Pressable>
        <Pressable
          style={[todagiStyles.selectBox, todagiStyles.missionFrequencySelect]}
          onPress={onPressFrequencySelect}
        >
          <Text style={todagiStyles.selectText}>{missionFrequency}</Text>
        </Pressable>
      </View>
    </View>
  );
}
