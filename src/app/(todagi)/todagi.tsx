import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

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
import { useGrowth } from '@/contexts/GrowthContext';

export default function TodagiScreen() {
  const router = useRouter();
  const { childId, boardId, returnTo, mode } = useLocalSearchParams<{
    childId?: string;
    boardId?: string;
    returnTo?: string;
    mode?: string;
  }>();

  const isMissionsMode = mode === 'missions';
  const {
    addStickerBoard,
    updateStickerBoard,
    getChildById,
    getBoardById,
    getBoardByChildId,
    children,
  } = useGrowth();

  const resolvedChildId = useMemo(() => childId ?? children[0]?.id, [childId, children]);
  const child = getChildById(resolvedChildId);
  const board = getBoardById(boardId);
  const existingBoard = getBoardByChildId(resolvedChildId);
  const isEditMode = typeof boardId === 'string' && !!board;

  const [boardTitle, setBoardTitle] = useState('');
  const [stickerCount, setStickerCount] = useState('30개');
  const [boardDesign, setBoardDesign] = useState('성장 나무');
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

  useEffect(() => {
    if (!child || isEditMode) {
      return;
    }

    setBoardTitle(`${child.name}의 스티커판`);
  }, [child, isEditMode]);

  useEffect(() => {
    if (!board) {
      return;
    }

    setBoardTitle(board.title);
    setStickerCount(board.stickerCount);
    setBoardDesign(board.boardDesign);
    setRewardText(board.rewardText);
    setMissions(board.missions);
  }, [board]);

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
        : [...prev, newMission]
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
      id: Date.now().toString(),
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

  const handlePublish = () => {
    if (isMissionsMode) {
      if (!board || !boardId) return;
      if (missions.length === 0) {
        Alert.alert('알림', '미션을 한 개 이상 추가해주세요.');
        return;
      }
      const hasEmptyTitle = missions.some((m) => !m.title.trim());
      if (hasEmptyTitle) {
        Alert.alert('알림', '모든 미션의 이름을 입력해주세요.');
        return;
      }
      updateStickerBoard(boardId, {
        childId: board.childId,
        title: board.title,
        stickerCount: board.stickerCount,
        boardDesign: board.boardDesign,
        rewardText: board.rewardText,
        missions,
      });
      navigateBack();
      return;
    }

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

    const boardInput = {
      childId: resolvedChildId,
      title: boardTitle.trim(),
      stickerCount,
      boardDesign,
      rewardText: rewardText.trim(),
      missions,
    };

    if (isEditMode && boardId) {
      updateStickerBoard(boardId, boardInput);
    } else {
      addStickerBoard(boardInput);
    }

    Alert.alert('완료', `"${child.name}"의 스티커 판이 ${isEditMode ? '수정' : '발행'}되었습니다!`, [
      { text: '확인', onPress: navigateBack },
    ]);
  };

  const footerTitle = isMissionsMode
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
          />
        }
      >
        {!isMissionsMode && child ? (
          <Section title="연결된 성장이">
            <ChildSummaryCard name={child.name} birthday={child.birthday} />
          </Section>
        ) : null}

        {!isMissionsMode ? (
          <BoardBasicsSection
            boardTitle={boardTitle}
            stickerCount={stickerCount}
            boardDesign={boardDesign}
            onChangeBoardTitle={setBoardTitle}
            onPressStickerCount={() => setStickerModal(true)}
            onPressBoardDesign={() => setDesignModal(true)}
          />
        ) : null}

        {isMissionsMode ? (
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

        {!isMissionsMode ? (
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
