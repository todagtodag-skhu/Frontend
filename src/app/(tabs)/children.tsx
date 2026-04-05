import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { ChildrenEmptyState } from '@/components/children/ChildrenEmptyState';
import { ChildSelectorRow } from '@/components/children/ChildSelectorRow';
import { EditChildModal } from '@/components/children/EditChildModal';
import { EditStickerBoardModal } from '@/components/children/EditStickerBoardModal';
import { MissionAssignmentList } from '@/components/children/MissionAssignmentList';
import { NoActiveBoardState } from '@/components/children/NoActiveBoardState';
import { StickerBoardSummaryCard } from '@/components/children/StickerBoardSummaryCard';
import { StickerRequestModal } from '@/components/children/StickerRequestModal';
import { childrenStyles as styles } from '@/components/children/styles';
import { AppScreen } from '@/components/layout/AppScreen';
import { Text } from '@/components/ui/Text';
import { useGrowth } from '@/contexts/GrowthContext';

export default function ChildrenScreen() {
  const router = useRouter();
  const { focusChildId } = useLocalSearchParams<{ focusChildId?: string }>();
  const { children, getBoardsByChildId, updateChild, updateStickerBoard } = useGrowth();

  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(focusChildId);
  const [editChildVisible, setEditChildVisible] = useState(false);
  const [editBoardVisible, setEditBoardVisible] = useState(false);
  const [stickerRequestVisible, setStickerRequestVisible] = useState(false);
  const [dismissedMissionIds, setDismissedMissionIds] = useState<Set<string>>(new Set());

  const handleDismissMission = (missionId: string) => {
    setDismissedMissionIds((prev) => new Set(prev).add(missionId));
  };

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
  const remainingMissionCount = (activeBoard?.missions ?? []).filter((m) => !dismissedMissionIds.has(m.id)).length;
  const showNotification = selectedChild?.id === focusChildId || remainingMissionCount > 0;

  const handlePressAddChild = () => {
    router.push('/register-child');
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
        ...(activeBoard ? { boardId: activeBoard.id, mode: 'missions' } : {}),
      },
    });
  };

  const handleSaveChild = (name: string, birthday: string) => {
    if (!selectedChild) return;
    updateChild(selectedChild.id, {
      inviteCode: selectedChild.inviteCode,
      name,
      birthday,
    });
    setEditChildVisible(false);
  };

  const handleSaveBoard = (title: string, stickerCount: string, boardDesign: string, rewardText: string) => {
    if (!activeBoard || !selectedChild) return;
    updateStickerBoard(activeBoard.id, {
      childId: selectedChild.id,
      title,
      stickerCount,
      boardDesign,
      rewardText,
      missions: activeBoard.missions,
    });
    setEditBoardVisible(false);
  };

  return (
    <>
      <AppScreen bodyStyle={styles.content}>
        <ChildSelectorRow
          children={children}
          selectedChildId={selectedChild?.id}
          onSelectChild={setSelectedChildId}
          onPressAddChild={handlePressAddChild}
          onPressEditChild={selectedChild ? () => setEditChildVisible(true) : undefined}
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
                  onPressStickerButton={() => setStickerRequestVisible(true)}
                  onPressEditBoard={() => setEditBoardVisible(true)}
                />

                <MissionAssignmentList
                  missions={activeBoard.missions}
                  emptyText="등록된 미션이 아직 없어요."
                />
              </>
            ) : (
              <NoActiveBoardState />
            )}

            <Pressable style={styles.primaryButton} onPress={handlePressPrimaryAction}>
              <Text weight="bold" style={styles.primaryButtonText}>
                {activeBoard ? '미션 관리하기' : '스티커판 생성하기'}
              </Text>
            </Pressable>
          </>
        ) : (
          <ChildrenEmptyState onPressAddChild={handlePressAddChild} />
        )}
      </AppScreen>

      {selectedChild ? (
        <EditChildModal
          visible={editChildVisible}
          child={selectedChild}
          onSave={handleSaveChild}
          onClose={() => setEditChildVisible(false)}
        />
      ) : null}

      {activeBoard && selectedChild ? (
        <>
          <EditStickerBoardModal
            visible={editBoardVisible}
            board={activeBoard}
            onSave={handleSaveBoard}
            onClose={() => setEditBoardVisible(false)}
          />
          <StickerRequestModal
            visible={stickerRequestVisible}
            childName={selectedChild.name}
            missions={activeBoard.missions}
            dismissedIds={dismissedMissionIds}
            onDismiss={handleDismissMission}
            onClose={() => setStickerRequestVisible(false)}
          />
        </>
      ) : null}
    </>
  );
}
