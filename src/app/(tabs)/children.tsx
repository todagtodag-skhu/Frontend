import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { ChildrenEmptyState } from '@/components/children/ChildrenEmptyState';
import { ChildSelectorRow } from '@/components/children/ChildSelectorRow';
import { MissionAssignmentList } from '@/components/children/MissionAssignmentList';
import { NoActiveBoardState } from '@/components/children/NoActiveBoardState';
import { StickerBoardSummaryCard } from '@/components/children/StickerBoardSummaryCard';
import { childrenStyles as styles } from '@/components/children/styles';
import { AppScreen } from '@/components/layout/AppScreen';
import { Text } from '@/components/ui/Text';
import { useGrowth } from '@/contexts/GrowthContext';

export default function ChildrenScreen() {
  const router = useRouter();
  const { focusChildId } = useLocalSearchParams<{ focusChildId?: string }>();
  const { children, getBoardsByChildId } = useGrowth();

  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(focusChildId);

  useEffect(() => {
    if (focusChildId) {
      setSelectedChildId(focusChildId);
      return;
    }

    setSelectedChildId((prev) => prev ?? children[0]?.id);
  }, [children, focusChildId]);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) ?? children[0],
    [children, selectedChildId],
  );

  const selectedBoards = useMemo(
    () => getBoardsByChildId(selectedChild?.id),
    [getBoardsByChildId, selectedChild?.id],
  );

  const activeBoard = selectedBoards[0];
  const totalStickerCount = Number.parseInt(activeBoard?.stickerCount ?? '0', 10) || 0;
  const currentStickerCount = activeBoard ? Math.min(activeBoard.missions.length, totalStickerCount) : 0;
  const showNotification = selectedChild?.id === focusChildId;

  const handlePressAddChild = () => {
    router.push('/register-child');
  };

  const handlePressMission = () => {
    if (!selectedChild || !activeBoard) {
      return;
    }

    router.push({
      pathname: '/create-sticker',
      params: { childId: selectedChild.id, boardId: activeBoard.id, returnTo: 'children' },
    });
  };

  const handlePressPrimaryAction = () => {
    if (!selectedChild) {
      return;
    }

    router.push({
      pathname: '/create-sticker',
      params: {
        childId: selectedChild.id,
        returnTo: 'children',
        ...(activeBoard ? { boardId: activeBoard.id } : {}),
      },
    });
  };

  const handlePressChildDetail = () => {
    if (!selectedChild) {
      return;
    }

    router.push({
      pathname: '/child-detail',
      params: { childId: selectedChild.id },
    });
  };

  return (
    <AppScreen title="스티커판 관리" bodyStyle={styles.content}>
      <ChildSelectorRow
        children={children}
        selectedChildId={selectedChild?.id}
        onSelectChild={setSelectedChildId}
        onPressAddChild={handlePressAddChild}
      />

      {selectedChild ? (
        <>
          {activeBoard ? (
            <>
              <StickerBoardSummaryCard
                childName={selectedChild.name}
                board={activeBoard}
                currentStickerCount={currentStickerCount}
                totalStickerCount={totalStickerCount}
                showNotification={showNotification}
              />

              <MissionAssignmentList
                missions={activeBoard.missions}
                emptyText="등록된 미션이 아직 없어요."
                onPressMission={handlePressMission}
              />
            </>
          ) : (
            <NoActiveBoardState />
          )}

          <Pressable style={styles.primaryButton} onPress={handlePressPrimaryAction}>
            <Text weight="bold" style={styles.primaryButtonText}>
              {activeBoard ? '미션 추가하기' : '스티커판 생성하기'}
            </Text>
          </Pressable>

          <Pressable onPress={handlePressChildDetail}>
            <Text style={styles.editLink}>현재 성장이 정보 수정하기</Text>
          </Pressable>
        </>
      ) : (
        <ChildrenEmptyState onPressAddChild={handlePressAddChild} />
      )}
    </AppScreen>
  );
}
