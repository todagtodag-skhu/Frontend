import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/common/Button';
import { AppScreen } from '@/components/layout/AppScreen';
import { BoardBasicsSection } from '@/components/todagi/BoardBasicsSection';
import { ChildSummaryCard } from '@/components/todagi/ChildSummaryCard';
import {
  BOARD_DESIGN_OPTIONS,
  DEFAULT_MISSION_EMOJI,
  DEFAULT_SELECTED_DAYS,
  FREQUENCY_OPTIONS,
  STICKER_COUNT_OPTIONS,
} from '@/components/todagi/constants';
import { DaySelectModal } from '@/components/todagi/DaySelectModal';
import { EmojiInputModal } from '@/components/todagi/EmojiInputModal';
import { MissionBuilderSection } from '@/components/todagi/MissionBuilderSection';
import { MissionInlineEditorSection } from '@/components/todagi/MissionInlineEditorSection';
import { RewardSection } from '@/components/todagi/RewardSection';
import { Section } from '@/components/todagi/Section';
import { SelectModal } from '@/components/todagi/SelectModal';
import { todagiStyles as styles } from '@/components/todagi/styles';
import { Mission } from '@/components/todagi/types';
import { useTodakRelations } from '@/features/relation/hooks';
import {
  useTodakStickerBoard,
  TODAK_KEYS,
} from '@/features/todak/hooks';
import {
  BOARD_DESIGN_TO_API,
  STICKER_COUNT_TO_API,
  createTodakStickerBoard,
  updateTodakStickerBoard,
  createTodakMission,
  updateTodakMission,
  deleteTodakMission,
  formatStickerCountLabel,
  missionToApiInput,
} from '@/features/todak/api';

export default function TodagiScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    childId,
    boardId,
    returnTo,
    mode,
    initName,
    initStickerCount,
    initBoardDesign,
    initReward,
  } = useLocalSearchParams<{
    childId?: string;
    boardId?: string;
    returnTo?: string;
    mode?: string;
    initName?: string;
    initStickerCount?: string;
    initBoardDesign?: string;
    initReward?: string;
  }>();

  const isMissionsMode = mode === 'missions';
  // new-board: 스티커판 기본 정보는 params로 받고, 미션만 등록 후 한 번에 생성
  const isNewBoardMode = mode === 'new-board';

  const { data: relationsData } = useTodakRelations();

  const resolvedChildId = useMemo(
    () => childId ?? relationsData?.relations[0]?.relationId.toString(),
    [childId, relationsData],
  );

  const relationId = resolvedChildId ? parseInt(resolvedChildId, 10) : undefined;

  const { data: boardFromApi } = useTodakStickerBoard(relationId);

  const child = useMemo(() => {
    const relation = relationsData?.relations.find(
      (r) => r.relationId.toString() === resolvedChildId,
    );
    if (!relation) return undefined;
    return {
      id: resolvedChildId!,
      name: relation.sungjangName,
      birthday: '',
      inviteCode: '',
    };
  }, [relationsData, resolvedChildId]);

  const isEditMode = typeof boardId === 'string' && !!boardFromApi && boardFromApi.id === boardId;
  const existingBoard = boardFromApi ?? undefined;

  // originalMissionIds tracks which mission IDs came from the server
  const originalMissionIdsRef = useRef<Set<string>>(new Set());

  const [boardTitle, setBoardTitle] = useState('');
  const [stickerCount, setStickerCount] = useState('30개');
  const [boardDesign, setBoardDesign] = useState('호랑이');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionEmoji, setMissionEmoji] = useState(DEFAULT_MISSION_EMOJI);
  const [missionTitle, setMissionTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(DEFAULT_SELECTED_DAYS);
  const [missionFrequency, setMissionFrequency] = useState('하루 1회');
  const [rewardText, setRewardText] = useState('');
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [stickerModal, setStickerModal] = useState(false);
  const [designModal, setDesignModal] = useState(false);
  const [emojiModal, setEmojiModal] = useState(false);
  const [dayModal, setDayModal] = useState(false);
  const [frequencyModal, setFrequencyModal] = useState(false);
  const [editingEmojiForId, setEditingEmojiForId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // new-board 모드: params로 받은 기본 정보 초기화
  useEffect(() => {
    if (!isNewBoardMode) return;
    if (initName) setBoardTitle(initName);
    if (initStickerCount) setStickerCount(initStickerCount);
    if (initBoardDesign) setBoardDesign(initBoardDesign);
    if (initReward) setRewardText(initReward);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewBoardMode]);

  useEffect(() => {
    if (!child || isEditMode || isNewBoardMode) return;
    setBoardTitle(`${child.name}의 스티커판`);
  }, [child, isEditMode, isNewBoardMode]);

  useEffect(() => {
    // Only populate form from API when editing/managing missions for a specific board
    if (!boardFromApi || !boardId) return;

    setBoardTitle(boardFromApi.title);
    setStickerCount(formatStickerCountLabel(boardFromApi.stickerCount) || '30개');
    setBoardDesign(boardFromApi.boardDesign);
    setRewardText(boardFromApi.rewardText);
    setMissions(boardFromApi.missions);

    // Store original mission IDs for diff in missions mode
    originalMissionIdsRef.current = new Set(boardFromApi.missions.map((m) => m.id));
  }, [boardFromApi, boardId]);

  const resetMissionForm = () => {
    setMissionEmoji(DEFAULT_MISSION_EMOJI);
    setMissionTitle('');
    setSelectedDays(DEFAULT_SELECTED_DAYS);
    setMissionFrequency('하루 1회');
    setEditingMissionId(null);
  };

  const handleAddMission = () => {
    if (!missionTitle.trim()) {
      Alert.alert('알림', '미션 이름을 입력해주세요.');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('알림', '요일을 선택해주세요.');
      return;
    }
    const newMission: Mission = {
      id: editingMissionId ?? Date.now().toString(),
      emoji: missionEmoji,
      title: missionTitle.trim(),
      days: selectedDays.join(','),
      frequency: missionFrequency,
    };

    setMissions((prev) =>
      editingMissionId
        ? prev.map((mission) => (mission.id === editingMissionId ? newMission : mission))
        : [...prev, newMission],
    );

    resetMissionForm();
  };

  const handleEditMission = (mission: Mission) => {
    setEditingMissionId(mission.id);
    setMissionEmoji(mission.emoji);
    setMissionTitle(mission.title);
    setSelectedDays(mission.days.split(',').filter(Boolean));
    setMissionFrequency(mission.frequency);
  };

  const handleDeleteMission = (id: string) => {
    Alert.alert('미션 삭제', '이 미션을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setMissions((prev) => prev.filter((mission) => mission.id !== id));
          if (editingMissionId === id) {
            resetMissionForm();
          }
        },
      },
    ]);
  };

  const handleUpdateMission = (id: string, patch: Partial<Mission>) => {
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const handleAddNewMission = () => {
    const newMission: Mission = {
      id: `new-${Date.now()}`,
      emoji: '⭐',
      title: '',
      days: '',
      frequency: '하루 1회',
      completionCount: 1,
      stickerPerCompletion: 1,
    };
    setMissions((prev) => [...prev, newMission]);
  };

  const handleDeleteMissionInline = (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  };

  const navigateBack = () => {
    if (returnTo === 'child-detail') {
      router.replace({ pathname: '/child-detail', params: { childId: resolvedChildId } });
      return;
    }
    router.replace({
      pathname: '/children',
      params: resolvedChildId ? { focusChildId: resolvedChildId } : undefined,
    });
  };

  const handlePublish = async () => {
    if (isSubmitting) return;

    // ── New-board mode: 미션 등록 후 스티커판 + 미션 한 번에 생성 ──
    if (isNewBoardMode) {
      if (!relationId) return;
      if (missions.length === 0) {
        Alert.alert('알림', '미션을 한 개 이상 추가해주세요.');
        return;
      }
      const hasEmptyTitle = missions.some((m) => !m.title.trim());
      if (hasEmptyTitle) {
        Alert.alert('알림', '모든 미션의 이름을 입력해주세요.');
        return;
      }

      setIsSubmitting(true);
      try {
        await createTodakStickerBoard(relationId, {
          name: boardTitle.trim() || (initName ?? ''),
          stickerCount: STICKER_COUNT_TO_API[stickerCount] ?? 'THIRTY',
          boardDesign: BOARD_DESIGN_TO_API[boardDesign] ?? 'TIGER',
          missions: missions.map(missionToApiInput),
          finalReward: rewardText.trim() || (initReward ?? ''),
        });
        queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId) });
        Alert.alert('완료', '스티커판이 생성되었습니다!', [
          { text: '확인', onPress: navigateBack },
        ]);
      } catch {
        Alert.alert('오류', '스티커판 생성에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ── Missions mode: diff existing missions and call CRUD APIs ──
    if (isMissionsMode) {
      if (!boardId || !relationId) return;
      if (missions.length === 0) {
        Alert.alert('알림', '미션을 한 개 이상 추가해주세요.');
        return;
      }
      const hasEmptyTitle = missions.some((m) => !m.title.trim());
      if (hasEmptyTitle) {
        Alert.alert('알림', '모든 미션의 이름을 입력해주세요.');
        return;
      }

      setIsSubmitting(true);
      try {
        const originalIds = originalMissionIdsRef.current;
        const currentIds = new Set(missions.map((m) => m.id));

        // Missions removed by the user
        const deletedIds = [...originalIds].filter((id) => !currentIds.has(id));

        // Newly added missions (have 'new-' prefix)
        const newMissions = missions.filter((m) => m.id.startsWith('new-'));

        // Existing missions that may have been updated
        const updatedMissions = missions.filter(
          (m) => !m.id.startsWith('new-') && originalIds.has(m.id),
        );

        await Promise.all([
          ...deletedIds.map((id) => deleteTodakMission(parseInt(id, 10))),
          ...newMissions.map((m) => createTodakMission(relationId, missionToApiInput(m))),
          ...updatedMissions.map((m) =>
            updateTodakMission(parseInt(m.id, 10), missionToApiInput(m)),
          ),
        ]);

        queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId) });
        navigateBack();
      } catch {
        Alert.alert('오류', '미션 저장에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ── Create / edit board mode ──
    if (!resolvedChildId || !child) {
      Alert.alert('알림', '먼저 성장이를 연결해주세요.');
      return;
    }
    if (!boardTitle.trim()) {
      Alert.alert('알림', '판 이름을 입력해주세요.');
      return;
    }
    if (missions.length === 0) {
      Alert.alert('알림', '미션을 한 개 이상 추가해주세요.');
      return;
    }
    if (!rewardText.trim()) {
      Alert.alert('알림', '최종 보상을 입력해주세요.');
      return;
    }
    if (!isEditMode && existingBoard) {
      Alert.alert('알림', '현재 활성 스티커판이 있어요. 스티커판은 한 번에 하나만 만들 수 있어요.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && boardId) {
        // Edit board basics only (no missions in PATCH)
        await updateTodakStickerBoard(parseInt(boardId, 10), {
          name: boardTitle.trim(),
          stickerCount: STICKER_COUNT_TO_API[stickerCount] ?? 'THIRTY',
          boardDesign: BOARD_DESIGN_TO_API[boardDesign] ?? 'TIGER',
          finalReward: rewardText.trim(),
        });
      } else {
        // Create new board with missions
        await createTodakStickerBoard(relationId!, {
          name: boardTitle.trim(),
          stickerCount: STICKER_COUNT_TO_API[stickerCount] ?? 'THIRTY',
          boardDesign: BOARD_DESIGN_TO_API[boardDesign] ?? 'TIGER',
          missions: missions.map(missionToApiInput),
          finalReward: rewardText.trim(),
        });
      }

      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId!) });
      Alert.alert(
        '완료',
        `"${child.name}"의 스티커 판이 ${isEditMode ? '수정' : '발행'}되었습니다!`,
        [{ text: '확인', onPress: navigateBack }],
      );
    } catch {
      Alert.alert('오류', '스티커판 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerTitle =
    isMissionsMode || isNewBoardMode
      ? `미션 ${missions.length}개 저장하기`
      : isEditMode
      ? '스티커 판 수정하기'
      : '스티커 판 발행하기';

  return (
    <>
      <AppScreen
        bodyStyle={styles.scrollView}
        footer={
          <Button
            title={footerTitle}
            onPress={handlePublish}
            style={styles.footerButton}
            disabled={isSubmitting}
          />
        }
      >
        {!isMissionsMode && !isNewBoardMode && child ? (
          <Section title="연결된 성장이">
            <ChildSummaryCard name={child.name} birthday={child.birthday} />
          </Section>
        ) : null}

        {!isMissionsMode && !isNewBoardMode ? (
          <BoardBasicsSection
            boardTitle={boardTitle}
            stickerCount={stickerCount}
            boardDesign={boardDesign}
            onChangeBoardTitle={setBoardTitle}
            onPressStickerCount={() => setStickerModal(true)}
            onPressBoardDesign={() => setDesignModal(true)}
          />
        ) : null}

        {isMissionsMode || isNewBoardMode ? (
          <MissionInlineEditorSection
            missions={missions}
            onPressMissionEmoji={setEditingEmojiForId}
            onChangeTitle={(missionId, title) => handleUpdateMission(missionId, { title })}
            onChangeCompletionCount={(missionId, count) =>
              handleUpdateMission(missionId, { completionCount: count })
            }
            onChangeStickerPerCompletion={(missionId, count) =>
              handleUpdateMission(missionId, { stickerPerCompletion: count })
            }
            onDeleteMission={handleDeleteMissionInline}
            onAddMission={handleAddNewMission}
          />
        ) : (
          <MissionBuilderSection
            missions={missions}
            missionEmoji={missionEmoji}
            missionTitle={missionTitle}
            selectedDays={selectedDays}
            missionFrequency={missionFrequency}
            editingMissionId={editingMissionId}
            onPressMission={handleEditMission}
            onLongPressMission={handleDeleteMission}
            onPressEmojiSelect={() => setEmojiModal(true)}
            onChangeMissionTitle={setMissionTitle}
            onPressDaySelect={() => setDayModal(true)}
            onPressFrequencySelect={() => setFrequencyModal(true)}
            onSubmitMission={handleAddMission}
            onCancelEdit={resetMissionForm}
          />
        )}

        {!isMissionsMode && !isNewBoardMode ? (
          <RewardSection
            rewardText={rewardText}
            onChangeRewardText={setRewardText}
          />
        ) : null}
      </AppScreen>

      <SelectModal
        visible={stickerModal}
        title="스티커 개수 선택"
        options={STICKER_COUNT_OPTIONS}
        onSelect={setStickerCount}
        onClose={() => setStickerModal(false)}
      />
      <SelectModal
        visible={designModal}
        title="판 디자인 선택"
        options={BOARD_DESIGN_OPTIONS}
        onSelect={setBoardDesign}
        onClose={() => setDesignModal(false)}
      />
      <EmojiInputModal
        visible={emojiModal || editingEmojiForId !== null}
        value={
          editingEmojiForId
            ? (missions.find((m) => m.id === editingEmojiForId)?.emoji ?? missionEmoji)
            : missionEmoji
        }
        onConfirm={(emoji) => {
          if (editingEmojiForId) {
            handleUpdateMission(editingEmojiForId, { emoji });
            setEditingEmojiForId(null);
          } else {
            setMissionEmoji(emoji);
          }
        }}
        onClose={() => {
          setEmojiModal(false);
          setEditingEmojiForId(null);
        }}
      />
      <DaySelectModal
        visible={dayModal}
        selectedDays={selectedDays}
        onConfirm={setSelectedDays}
        onClose={() => setDayModal(false)}
      />
      <SelectModal
        visible={frequencyModal}
        title="빈도 선택"
        options={FREQUENCY_OPTIONS}
        onSelect={setMissionFrequency}
        onClose={() => setFrequencyModal(false)}
      />
    </>
  );
}
