import { View } from 'react-native';

import { TextInput } from '@/components/common/TextInput';

import { InfoSelectCard } from './InfoSelectCard';
import { Section } from './Section';
import { todagiStyles as styles } from './styles';

type BoardBasicsSectionProps = {
  boardTitle: string;
  stickerCount: string;
  boardDesign: string;
  onChangeBoardTitle: (value: string) => void;
  onPressStickerCount: () => void;
  onPressBoardDesign: () => void;
};

export function BoardBasicsSection({
  boardTitle,
  stickerCount,
  boardDesign,
  onChangeBoardTitle,
  onPressStickerCount,
  onPressBoardDesign,
}: BoardBasicsSectionProps) {
  return (
    <Section title="기본 정보 설정">
      <TextInput
        placeholder="판 이름을 입력하세요"
        value={boardTitle}
        onChangeText={onChangeBoardTitle}
        align="left"
        size="md"
      />
      <View style={styles.row}>
        <InfoSelectCard
          label="스티커개수"
          value={stickerCount}
          onPress={onPressStickerCount}
        />
        <InfoSelectCard
          label="판 디자인"
          value={boardDesign}
          onPress={onPressBoardDesign}
        />
      </View>
    </Section>
  );
}
