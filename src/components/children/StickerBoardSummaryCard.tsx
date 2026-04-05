import { Pressable, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { StickerBoard } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';

import { childrenStyles as styles } from './styles';

type StickerBoardSummaryCardProps = {
  childName: string;
  board?: StickerBoard;
  currentStickerCount: number;
  totalStickerCount: number;
  showNotification: boolean;
  onPressStickerButton?: () => void;
  onPressEditBoard?: () => void;
};

export function StickerBoardSummaryCard({
  childName,
  board,
  currentStickerCount,
  totalStickerCount,
  showNotification,
  onPressStickerButton,
  onPressEditBoard,
}: StickerBoardSummaryCardProps) {
  const title = board?.title ?? `${childName}의 스티커판`;

  return (
    <View style={styles.boardCardWrapper}>
      <View style={styles.boardCard}>
      <View style={styles.boardCardHeader}>
        <Text weight="bold" style={styles.boardCardTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.stickerBadge}>
          <Text weight="bold" style={styles.stickerBadgeText}>
            {currentStickerCount} / {totalStickerCount || '-'}
          </Text>
        </View>
      </View>

      <View style={styles.boardCardMeta}>
        <View style={styles.boardMetaItem}>
          <MaterialCommunityIcons name="palette-outline" size={16} style={styles.boardMetaIcon} />
          <Text style={styles.boardCardMetaText}>{board?.boardDesign ?? '-'}</Text>
        </View>
        <Text style={styles.boardCardMetaDivider}>·</Text>
        <View style={styles.boardMetaItem}>
          <MaterialCommunityIcons name="gift-outline" size={16} style={styles.boardMetaIcon} />
          <Text style={styles.boardCardMetaText} numberOfLines={1}>
            {board?.rewardText ?? '보상 미설정'}
          </Text>
        </View>
      </View>

      <View style={styles.boardCardDivider} />

      <View style={styles.stickerGiveButtonWrapper}>
        <Pressable style={styles.stickerGiveButton} onPress={onPressStickerButton}>
          <MaterialCommunityIcons
            name="sticker-emoji"
            size={24}
            style={styles.stickerGiveButtonIcon}
          />
          <Text weight="bold" style={styles.stickerGiveButtonText}>
            칭찬 스티커 주기
          </Text>
        </Pressable>
        {showNotification ? (
          <View style={styles.notificationBadge}>
            <Text weight="bold" style={styles.notificationBadgeText}>!</Text>
          </View>
        ) : null}
      </View>

      </View>

      {onPressEditBoard ? (
        <Pressable style={styles.editBoardButton} onPress={onPressEditBoard}>
          <Text style={styles.editBoardButtonText}>스티커판 수정</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
