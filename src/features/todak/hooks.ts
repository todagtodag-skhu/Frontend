import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import type { CompletedStickerBoard } from '@/mocks/data';
import {
  getTodakStickerBoard,
  createTodakStickerBoard,
  updateTodakStickerBoard,
  getTodakMemory,
  createTodakMission,
  completeTodakMission,
  deleteTodakMission,
  updateTodakMission,
  getMissionRequests,
  acceptMissionRequest,
  rejectMissionRequest,
  giveTodakSticker,
  adaptApiStickerBoard,
  adaptApiCompletedBoard,
  BOARD_DESIGN_FROM_API,
  STICKER_COUNT_FROM_API,
} from './api';
import type {
  ApiCreateStickerBoardRequest,
  ApiUpdateStickerBoardRequest,
  ApiMissionInput,
  ApiGiveStickerRequest,
} from './types';

export const TODAK_KEYS = {
  stickerBoard: (relationId: number) => ['todak', 'sticker-board', relationId] as const,
  missions: (relationId: number) => ['todak', 'missions', relationId] as const,
  missionRequests: (relationId: number) => ['todak', 'mission-requests', relationId] as const,
  carriedMissionRequests: (relationId: number) => ['todak', 'carried-mission-requests', relationId] as const,
  memory: (relationId: number) => ['todak', 'memory', relationId] as const,
};

// ─── Sticker Board ──────────────────────────────────────────────────────────────

export function useTodakStickerBoard(
  relationId?: number,
  options?: { refetchInterval?: number | false },
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: TODAK_KEYS.stickerBoard(relationId!),
    queryFn: async () => {
      try {
        const board = await getTodakStickerBoard(relationId!);
        const previousBoard = queryClient.getQueryData<ReturnType<typeof adaptApiStickerBoard> | null>(
          TODAK_KEYS.stickerBoard(relationId!),
        );
        return adaptApiStickerBoard(board, relationId!, previousBoard);
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) return null;
        throw e;
      }
    },
    enabled: !!relationId,
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateStickerBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      relationId,
      ...body
    }: { relationId: number } & ApiCreateStickerBoardRequest) =>
      createTodakStickerBoard(relationId, body),
    onSuccess: (createdBoard, { relationId, name, stickerCount, boardDesign, finalReward, missions }) => {
      const stickerCountLabel = STICKER_COUNT_FROM_API[stickerCount];
      const totalStickerCount = stickerCountLabel.replace(/[^0-9]/g, '');

      queryClient.setQueryData(TODAK_KEYS.stickerBoard(relationId), {
        id: createdBoard.stickerBoardId.toString(),
        childId: relationId.toString(),
        title: name,
        stickerCount: stickerCountLabel,
        remainingStickerCount: totalStickerCount,
        boardDesign: BOARD_DESIGN_FROM_API[boardDesign] ?? boardDesign,
        rewardText: finalReward,
        missions: missions.map((mission, index) => ({
          id: `new-${index}`,
          emoji: mission.emoticon,
          title: mission.name,
          days: '',
          frequency: `${mission.targetCount}회 달성 시 스티커 ${mission.rewardStickerCount}개`,
          completionCount: mission.targetCount,
          stickerPerCompletion: mission.rewardStickerCount,
          isRequested: false,
        })),
      });
      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId) });
    },
  });
}

export function useUpdateStickerBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      stickerBoardId,
      relationId: _relationId,
      ...body
    }: { stickerBoardId: number; relationId: number } & ApiUpdateStickerBoardRequest) =>
      updateTodakStickerBoard(stickerBoardId, body),
    onSuccess: (board, { relationId, stickerCount }) => {
      queryClient.setQueryData(
        TODAK_KEYS.stickerBoard(relationId),
        adaptApiStickerBoard(board, relationId, {
          id: board.stickerBoardId.toString(),
          childId: relationId.toString(),
          title: board.name,
          stickerCount: STICKER_COUNT_FROM_API[stickerCount],
          remainingStickerCount: board.remainingStickerCount,
          boardDesign: board.boardDesign,
          rewardText: board.finalReward,
          missions: [],
        }),
      );
    },
  });
}

export function useTodakMemory(relationId?: number) {
  return useQuery({
    queryKey: TODAK_KEYS.memory(relationId!),
    queryFn: async (): Promise<CompletedStickerBoard[]> => {
      const response = await getTodakMemory(relationId!);
      return response.stickerBoards.map(adaptApiCompletedBoard);
    },
    enabled: !!relationId,
  });
}

// ─── Mission ────────────────────────────────────────────────────────────────────

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      relationId,
      ...body
    }: { relationId: number } & ApiMissionInput) =>
      createTodakMission(relationId, body),
    onSuccess: (_, { relationId }) => {
      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId) });
    },
  });
}

export function useUpdateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      missionId,
      relationId: _relationId,
      ...body
    }: { missionId: number; relationId: number } & ApiMissionInput) =>
      updateTodakMission(missionId, body),
    onSuccess: (_, { relationId }) => {
      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId) });
    },
  });
}

export function useDeleteMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      missionId,
      relationId: _relationId,
    }: { missionId: number; relationId: number }) =>
      deleteTodakMission(missionId),
    onSuccess: (_, { relationId }) => {
      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId) });
    },
  });
}

export function useCompleteMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      missionId,
      relationId: _relationId,
    }: { missionId: number; relationId: number }) =>
      completeTodakMission(missionId),
    onSuccess: (_, { relationId }) => {
      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId) });
    },
  });
}

// ─── Mission Request (조르기) ────────────────────────────────────────────────────

export function useMissionRequests(relationId?: number) {
  return useQuery({
    queryKey: TODAK_KEYS.missionRequests(relationId!),
    queryFn: () => getMissionRequests(relationId!),
    enabled: !!relationId,
  });
}

export function useAcceptMissionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      missionRequestId,
      relationId: _relationId,
    }: { missionRequestId: number; relationId: number }) =>
      acceptMissionRequest(missionRequestId),
    onSuccess: (_, { relationId }) => {
      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.missionRequests(relationId) });
      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId) });
    },
  });
}

export function useRejectMissionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      missionRequestId,
      relationId: _relationId,
    }: { missionRequestId: number; relationId: number }) =>
      rejectMissionRequest(missionRequestId),
    onSuccess: (_, { relationId }) => {
      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.missionRequests(relationId) });
    },
  });
}

// ─── Sticker (수동 부여) ────────────────────────────────────────────────────────

export function useGiveSticker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      relationId,
      ...body
    }: { relationId: number } & ApiGiveStickerRequest) =>
      giveTodakSticker(relationId, body),
    onSuccess: (_, { relationId }) => {
      queryClient.invalidateQueries({ queryKey: TODAK_KEYS.stickerBoard(relationId) });
    },
  });
}
