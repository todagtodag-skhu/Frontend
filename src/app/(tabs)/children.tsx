import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Alert, Pressable } from 'react-native';

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
import { ChildProfile, StickerRequest } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';
import { useTodakRelations, useUpdateSungjangInfo } from '@/features/relation/hooks';
import {
  useTodakStickerBoard,
  useUpdateStickerBoard,
  useMissionRequests,
  useAcceptMissionRequest,
  useRejectMissionRequest,
  useGiveSticker,
  TODAK_KEYS,
} from '@/features/todak/hooks';
import {
  BOARD_DESIGN_TO_API,
  STICKER_COUNT_TO_API,
} from '@/features/todak/api';
import { toISODate } from '@/lib/dateUtils';

export default function ChildrenScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { focusChildId, reopenStickerRequests } = useLocalSearchParams<{
    focusChildId?: string;
    reopenStickerRequests?: string;
  }>();
  const isFocused = useIsFocused();

  const { data: relationsData, isLoading } = useTodakRelations();
  const updateSungjangInfo = useUpdateSungjangInfo();
  const updateStickerBoardMutation = useUpdateStickerBoard();
  const acceptRequest = useAcceptMissionRequest();
  const rejectRequest = useRejectMissionRequest();
  const giveSticker = useGiveSticker();

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
  const [hasConsumedReopenParam, setHasConsumedReopenParam] = useState(false);

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

  const selectedRelationId = selectedChild ? parseInt(selectedChild.id, 10) : undefined;

  const { data: activeBoardData, refetch: refetchActiveBoard } = useTodakStickerBoard(selectedRelationId);
  const { data: missionRequestData, refetch: refetchMissionRequests } = useMissionRequests(selectedRelationId);
  const { data: carriedRequests = [] } = useQuery<StickerRequest[]>({
    queryKey: selectedRelationId ? TODAK_KEYS.carriedMissionRequests(selectedRelationId) : ['todak', 'carried-mission-requests', 'idle'],
    queryFn: async () => [],
    enabled: !!selectedRelationId,
    initialData: [],
  });

  const activeBoard = activeBoardData ?? undefined;
  const stickerRequests = missionRequestData?.requests ?? [];
  const previousStickerRequests = useMemo(() => {
    const serverPreviousRequests = missionRequestData?.previousRequests ?? [];
    const dedupedCurrentIds = new Set([...stickerRequests, ...serverPreviousRequests].map((request) => request.id));
    const nextCarriedRequests = carriedRequests.filter((request) => !dedupedCurrentIds.has(request.id));

    return [...serverPreviousRequests, ...nextCarriedRequests];
  }, [carriedRequests, missionRequestData?.previousRequests, stickerRequests]);

  const visibleStickerRequests = useMemo(
    () => [...previousStickerRequests, ...stickerRequests].filter((request) => !dismissedMissionIds.has(request.id)),
    [dismissedMissionIds, previousStickerRequests, stickerRequests],
  );

  const apiRemainingStickerCount = Number.parseInt(activeBoard?.remainingStickerCount ?? '0', 10) || 0;
  const totalStickerCount = Number.parseInt(activeBoard?.stickerCount ?? '0', 10) || 0;
  const currentStickerCount = Math.max(totalStickerCount - apiRemainingStickerCount, 0);
  const showNotification = visibleStickerRequests.length > 0;

  useEffect(() => {
    if (!isFocused || !selectedRelationId) return;

    void refetchActiveBoard();
    void refetchMissionRequests();
  }, [isFocused, refetchActiveBoard, refetchMissionRequests, selectedRelationId]);

  useEffect(() => {
    setGivenStickerCount(0);
    setDismissedMissionIds(new Set());
  }, [activeBoard?.id, activeBoard?.remainingStickerCount]);

  useEffect(() => {
    if (!isFocused || reopenStickerRequests !== '1' || !activeBoard || hasConsumedReopenParam) return;
    setStickerRequestVisible(true);
    setHasConsumedReopenParam(true);
    router.replace({
      pathname: '/children',
      params: selectedChild?.id ? { focusChildId: selectedChild.id } : undefined,
    });
  }, [activeBoard, hasConsumedReopenParam, isFocused, reopenStickerRequests, router, selectedChild?.id]);

  useEffect(() => {
    if (reopenStickerRequests === '1') {
      setHasConsumedReopenParam(false);
    }
  }, [reopenStickerRequests]);

  const updateCarriedRequests = (updater: (prev: StickerRequest[]) => StickerRequest[]) => {
    if (!selectedRelationId) return;
    queryClient.setQueryData<StickerRequest[]>(
      TODAK_KEYS.carriedMissionRequests(selectedRelationId),
      (prev) => updater(prev ?? []),
    );
  };

  const persistVisibleRequestsAsCarryOver = (extraRequests: StickerRequest[] = []) => {
    updateCarriedRequests((prev) => {
      const merged = [...prev, ...previousStickerRequests, ...stickerRequests, ...extraRequests]
        .filter((request) => !dismissedMissionIds.has(request.id));
      const deduped = new Map(merged.map((request) => [request.id, request]));
      return [...deduped.values()];
    });
  };

  const handleDismissMission = (missionId: string) => {
    setDismissedMissionIds((prev) => new Set(prev).add(missionId));
  };

  const resetBoardProgressState = () => {
    setGivenStickerCount(0);
    setDismissedMissionIds(new Set());
  };

  const openNewBoardFlow = () => {
    resetBoardProgressState();
    setStickerRequestVisible(false);
    setBoardFullVisible(true);
  };

  const handleManualSticker = async (): Promise<boolean> => {
    if (apiRemainingStickerCount - givenStickerCount <= 0) {
      persistVisibleRequestsAsCarryOver();
      openNewBoardFlow();
      return false;
    }
    const relationId = selectedChild ? parseInt(selectedChild.id, 10) : null;
    if (!relationId) return false;
    try {
      await giveSticker.mutateAsync({ relationId, content: null, emoticon: '⭐' });
      setGivenStickerCount((prev) => prev + 1);
      return true;
    } catch {
      Alert.alert('오류', '스티커 지급에 실패했습니다. 다시 시도해주세요.');
      return false;
    }
  };

  const handleNewBoard = () => {
    resetBoardProgressState();
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
        params: {
          childId: selectedChild.id,
          returnTo: 'children',
          boardId: activeBoard.id,
          mode: 'missions',
        },
      });
    } else {
      setCreateBoardVisible(true);
    }
  };

  const handleCreateBoard = (
    title: string,
    stickerCount: string,
    boardDesign: string,
    rewardText: string,
  ) => {
    if (!selectedChild) return;
    resetBoardProgressState();
    setCreateBoardVisible(false);
    // API는 todagi.tsx에서 미션까지 다 모은 후 한 번에 호출
    router.push({
      pathname: '/create-sticker',
      params: {
        childId: selectedChild.id,
        returnTo: 'children',
        mode: 'new-board',
        initName: title,
        initStickerCount: stickerCount,
        initBoardDesign: boardDesign,
        initReward: rewardText,
        ...(carriedRequests.length > 0 ? { reopenStickerRequests: '1' } : {}),
      },
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

    updateStickerBoardMutation.mutate(
      {
        stickerBoardId: parseInt(activeBoard.id, 10),
        relationId: parseInt(selectedChild.id, 10),
        name: title,
        stickerCount: STICKER_COUNT_TO_API[stickerCount] ?? 'THIRTY',
        boardDesign: BOARD_DESIGN_TO_API[boardDesign] ?? 'TIGER',
        finalReward: rewardText,
      },
      {
        onSuccess: () => {
          setEditBoardVisible(false);
        },
        onError: () => {
          Alert.alert('오류', '스티커판 수정에 실패했습니다.');
        },
      },
    );
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
                  showTotalStickerCount={totalStickerCount > 0}
                  remainingStickerCount={apiRemainingStickerCount}
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
            requests={stickerRequests}
            previousRequests={previousStickerRequests}
            dismissedIds={dismissedMissionIds}
            onDismiss={async (requestId, action) => {
              const missionRequestId = parseInt(requestId, 10);
              const relationId = parseInt(selectedChild.id, 10);
              const targetRequest = [...previousStickerRequests, ...stickerRequests].find(
                (request) => request.id === requestId,
              );
              if (!targetRequest) return false;

              if (action === 'accept') {
                if (apiRemainingStickerCount - givenStickerCount < targetRequest.stickerCount) {
                  persistVisibleRequestsAsCarryOver([targetRequest]);
                  openNewBoardFlow();
                  return false;
                }

                try {
                  await acceptRequest.mutateAsync({ missionRequestId, relationId });
                  handleDismissMission(requestId);
                  updateCarriedRequests((prev) => prev.filter((request) => request.id !== requestId));
                  setGivenStickerCount((prev) => prev + targetRequest.stickerCount);
                  return true;
                } catch (error) {
                  if (axios.isAxiosError(error) && error.response?.status === 409) {
                    persistVisibleRequestsAsCarryOver([targetRequest]);
                    openNewBoardFlow();
                    return false;
                  }
                  Alert.alert('오류', '스티커 지급에 실패했습니다. 다시 시도해주세요.');
                  return false;
                }
              } else {
                try {
                  await rejectRequest.mutateAsync({ missionRequestId, relationId });
                  handleDismissMission(requestId);
                  updateCarriedRequests((prev) => prev.filter((request) => request.id !== requestId));
                  return true;
                } catch {
                  Alert.alert('오류', '미션 요청 거절에 실패했습니다. 다시 시도해주세요.');
                  return false;
                }
              }
            }}
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
