import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  attachGrowthSticker,
  getCompletedGrowthStickerBoards,
  getGrowthStickerBoard,
  requestMissionSticker,
  type GrowthStickerBoard,
} from '@/features/growth/api';
import { type CompletedStickerBoard } from '@/mocks/data';

export const GROWTH_QUERY_KEYS = {
  all: ['growth'] as const,
  board: () => [...GROWTH_QUERY_KEYS.all, 'board'] as const,
  memoryBoards: () => [...GROWTH_QUERY_KEYS.all, 'memory-boards'] as const,
} as const;

export function useGrowthStickerBoard() {
  return useQuery<GrowthStickerBoard, Error>({
    queryKey: GROWTH_QUERY_KEYS.board(),
    queryFn: getGrowthStickerBoard,
  });
}

export function useRequestMissionSticker() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (missionId: string) => requestMissionSticker(missionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROWTH_QUERY_KEYS.board() });
    },
  });
}

export function useAttachGrowthSticker() {
  const queryClient = useQueryClient();

  return useMutation<GrowthStickerBoard, Error, number>({
    mutationFn: (position: number) => attachGrowthSticker(position),
    onSuccess: (board) => {
      queryClient.setQueryData(GROWTH_QUERY_KEYS.board(), board);
    },
  });
}

export function useCompletedGrowthStickerBoards() {
  return useQuery<CompletedStickerBoard[], Error>({
    queryKey: GROWTH_QUERY_KEYS.memoryBoards(),
    queryFn: getCompletedGrowthStickerBoards,
  });
}
