import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable } from 'react-native';

import { MOCK_PREVIOUS_STICKER_REQUESTS, MOCK_STICKER_REQUESTS } from '@/mocks/data';

import { ChildrenEmptyState } from '@/components/children/ChildrenEmptyState';
import { ChildSelectorRow } from '@/components/children/ChildSelectorRow';
import { ConfirmModal } from '@/components/children/ConfirmModal';
import { EditChildModal } from '@/components/children/EditChildModal';
import { EditStickerBoardModal } from '@/components/children/EditStickerBoardModal';
import { MissionAssignmentList } from '@/components/children/MissionAssignmentList';
import { NoActiveBoardState } from '@/components/children/NoActiveBoardState';
import { StickerBoardSummaryCard } from '@/components/children/StickerBoardSummaryCard';
import { StickerRequestModal } from '@/components/children/StickerRequestModal';
import { childrenStyles as styles } from '@/components/children/styles';
import { AppScreen } from '@/components/layout/AppScreen';
import { ChildProfile } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';
import { useTodakRelations, useUpdateSungjangInfo } from '@/features/relation/hooks';
import { toISODate } from '@/lib/dateUtils';
import { useGrowth } from '@/contexts/GrowthContext';

export default function ChildrenScreen() {
  const router = useRouter();
  const { focusChildId } = useLocalSearchParams<{ focusChildId?: string }>();
  const { getBoardsByChildId, addStickerBoard, updateStickerBoard } = useGrowth();

  const { data: relationsData, isLoading } = useTodakRelations();
  const updateSungjangInfo = useUpdateSungjangInfo();

  // 서버 데이터 + 로컬 생일 오버레이 관리
  const [localBirthdays, setLocalBirthdays] = useState<Record<string, string>>({});

  const children: ChildProfile[] = useMemo(
    () =>
      (relationsData?.relations ?? []).map((r) => ({
        id: r.relationId.toString(),
        name: r.sungjangName,
        birthday: localBirthdays[r.relationId.toString()] ?? '',
        inviteCode: '',
      })),
    [relationsData, localBirthdays],
  );

  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(focusChildId);
  const [editChildVisible, setEditChildVisible] = useState(false);
  const [createBoardVisible, setCreateBoardVisible] = useState(false);
  const [editBoardVisible, setEditBoardVisible] = useState(false);
  const [stickerRequestVisible, setStickerRequestVisible] = useState(false);
  const [boardFullVisible, setBoardFullVisible] = useState(false);
  const [dismissedMissionIds, setDismissedMissionIds] = useState<Set<string>>(new Set());
  const [givenStickerCount, setGivenStickerCount] = useState(0);

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
  const currentStickerCount = givenStickerCount;
  const remainingMissionCount = (activeBoard?.missions ?? []).filter(
    (m) => !dismissedMissionIds.has(m.id),
  ).length;
  const showNotification = selectedChild?.id === focusChildId || remainingMissionCount > 0;

  useEffect(() => {
    setGivenStickerCount(0);
  }, [activeBoard?.id]);

  const handleManualSticker = (): boolean => {
    if (givenStickerCount >= totalStickerCount) {
      setStickerRequestVisible(false);
      setBoardFullVisible(true);
      return false;
    }
    setGivenStickerCount((prev) => prev + 1);
    return true;
  };

  const handleNewBoard = () => {
    setBoardFullVisible(false);
    setCreateBoardVisible(true);
  };

  const handlePressAddChild = () => {
    router.push('/register-child');
  };

  const handlePressPrimaryAction = () => {
    if (!selectedChild) return;

    if (activeBoard) {
      router.push({
        pathname: '/create-sticker',
        params: { childId: selectedChild.id, returnTo: 'children', boardId: activeBoard.id, mode: 'missions' },
      });
    } else {
      setCreateBoardVisible(true);
    }
  };

  const handleCreateBoard = async (
    title: string,
    stickerCount: string,
    boardDesign: string,
    rewardText: string,
  ) => {
    if (!selectedChild) return;
    const boardId = await addStickerBoard({
      childId: selectedChild.id,
      title,
      stickerCount,
      boardDesign,
      rewardText,
      missions: [],
    });
    setCreateBoardVisible(false);
    router.push({
      pathname: '/create-sticker',
      params: { childId: selectedChild.id, returnTo: 'children', boardId, mode: 'missions' },
    });
  };

  const handleSaveChild = (name: string, birthday: string) => {
    if (!selectedChild) return;
    const relationId = parseInt(selectedChild.id, 10);

    updateSungjangInfo.mutate(
      {
        relationId,
        sungjangName: name,
        sungjangBirthday: toISODate(birthday),
      },
      {
        onSuccess: () => {
          setLocalBirthdays((prev) => ({ ...prev, [selectedChild.id]: birthday }));
          setEditChildVisible(false);
        },
        onError: () => {
          Alert.alert('오류', '성장이 정보 수정에 실패했습니다.');
        },
      },
    );
  };

  const handleSaveBoard = (
    title: string,
    stickerCount: string,
    boardDesign: string,
    rewardText: string,
  ) => {
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

  if (isLoading) {
    return <AppScreen bodyStyle={styles.content}>{null}</AppScreen>;
  }

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
        <EditStickerBoardModal
          visible={createBoardVisible}
          mode="create"
          onSave={handleCreateBoard}
          onClose={() => setCreateBoardVisible(false)}
        />
      ) : null}

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
            requests={MOCK_STICKER_REQUESTS}
            previousRequests={MOCK_PREVIOUS_STICKER_REQUESTS}
            dismissedIds={dismissedMissionIds}
            onDismiss={handleDismissMission}
            onManualSticker={handleManualSticker}
            onClose={() => setStickerRequestVisible(false)}
          />
        </>
      ) : null}

      <ConfirmModal
        visible={boardFullVisible}
        title={'이미 스티커를 다 채웠어요'}
        confirmLabel="새로만들기"
        onConfirm={handleNewBoard}
        onCancel={() => setBoardFullVisible(false)}
      />
    </>
  );
}
