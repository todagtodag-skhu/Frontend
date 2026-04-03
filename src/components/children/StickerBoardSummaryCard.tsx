import { Pressable, View } from 'react-native';

import { StickerBoard } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';

import { childrenStyles as styles } from './styles';

type StickerBoardSummaryCardProps = {
  childName: string;
  board?: StickerBoard;
  currentStickerCount: number;
  totalStickerCount: number;
  showNotification: boolean;
};

export function StickerBoardSummaryCard({
  childName,
  board,
  currentStickerCount,
  totalStickerCount,
  showNotification,
}: StickerBoardSummaryCardProps) {
  return (
    <View style={styles.boardCard}>
      <View style={styles.boardInfo}>
        <Text style={styles.boardInfoText}>
          스티커판 이름 : <Text weight="bold">{board?.title ?? `${childName}의 스티커판`}</Text>
        </Text>
        <Text style={styles.boardInfoText}>
          현재 스티커 개수 : <Text weight="bold">{currentStickerCount}/{totalStickerCount || '-'}</Text>
        </Text>
        <Text style={styles.boardInfoText}>
          스티커판 디자인 : <Text weight="bold">{board?.boardDesign ?? '-'}</Text>
        </Text>
        <Text style={styles.boardInfoText}>
          최종 보상 : <Text weight="bold">{board?.rewardText ?? '아직 설정되지 않았어요'}</Text>
        </Text>
      </View>

      <View style={styles.stickerActionColumn}>

        <Pressable style={styles.stickerButton}>
          {showNotification ? <View style={styles.notificationDot} /> : null}
          <Text style={styles.stickerButtonArt}>☺</Text>
          <Text style={styles.stickerButtonText}>칭찬 스티커</Text>
          <Text style={styles.stickerButtonText}>주기</Text>
        </Pressable>
      </View>
    </View>
  );
}
