import { apiClient } from '@/lib/apiClient';
import { Mission, StickerBoard } from '@/components/todagi/types';
import type { CompletedStickerBoard } from '@/mocks/data';
import type {
  ApiMission,
  ApiStickerBoard,
  ApiMissionInput,
  ApiCreateStickerBoardRequest,
  ApiUpdateStickerBoardRequest,
  ApiMissionRequestListResponse,
  ApiMemoryStorageResponse,
  ApiCompletedBoard,
  BoardDesignApi,
  StickerCountApi,
} from './types';

// ─── Mapping tables ────────────────────────────────────────────────────────────

export const BOARD_DESIGN_TO_API: Record<string, BoardDesignApi> = {
  '호랑이': 'TIGER',
  '래서판다': 'PANDA',
  '고양이': 'CAT',
};

export const BOARD_DESIGN_FROM_API: Record<BoardDesignApi, string> = {
  TIGER: '호랑이',
  PANDA: '래서판다',
  CAT: '고양이',
};

export const STICKER_COUNT_TO_API: Record<string, StickerCountApi> = {
  '20개': 'TWENTY',
  '30개': 'THIRTY',
  '50개': 'FIFTY',
};

// ─── Adapter functions ─────────────────────────────────────────────────────────

export function adaptApiMission(m: ApiMission): Mission {
  return {
    id: m.missionId.toString(),
    emoji: m.emoticon,
    title: m.name,
    days: '',
    frequency: `${m.targetCount}회 달성 시 스티커 ${m.rewardStickerCount}개`,
    completionCount: m.targetCount,
    stickerPerCompletion: m.rewardStickerCount,
  };
}

export function adaptApiStickerBoard(board: ApiStickerBoard, relationId: number): StickerBoard {
  return {
    id: board.stickerBoardId.toString(),
    childId: relationId.toString(),
    title: board.name,
    stickerCount: board.remainingStickerCount,
    boardDesign: BOARD_DESIGN_FROM_API[board.boardDesign] ?? board.boardDesign,
    rewardText: board.finalReward,
    missions: board.missions.map(adaptApiMission),
  };
}

export function adaptApiCompletedBoard(
  board: ApiCompletedBoard,
  index: number,
): CompletedStickerBoard {
  return {
    id: `completed-${index}`,
    title: board.name,
    reward: board.finalReward,
    boardDesign: '호랑이',
    stickers: board.stickers.map((s) => ({ emoji: '❤', title: s.content })),
  };
}

export function missionToApiInput(m: Mission): ApiMissionInput {
  return {
    name: m.title,
    emoticon: m.emoji,
    rewardStickerCount: m.stickerPerCompletion ?? 1,
    targetCount: m.completionCount ?? 1,
  };
}

// ─── Sticker Board ──────────────────────────────────────────────────────────────

export async function getTodakStickerBoard(relationId: number): Promise<ApiStickerBoard> {
  const { data } = await apiClient.get<ApiStickerBoard>(`/todak/sticker-board/${relationId}`);
  return data;
}

export async function createTodakStickerBoard(
  relationId: number,
  body: ApiCreateStickerBoardRequest,
): Promise<{ stickerBoardId: number }> {
  const { data } = await apiClient.post<{ stickerBoardId: number }>(
    `/todak/sticker-board/${relationId}`,
    body,
  );
  return data;
}

export async function updateTodakStickerBoard(
  stickerBoardId: number,
  body: ApiUpdateStickerBoardRequest,
): Promise<ApiStickerBoard> {
  const { data } = await apiClient.patch<ApiStickerBoard>(
    `/todak/sticker-board/${stickerBoardId}`,
    body,
  );
  return data;
}

export async function getTodakMemory(relationId: number): Promise<ApiMemoryStorageResponse> {
  const { data } = await apiClient.get<ApiMemoryStorageResponse>(
    `/todak/sticker-board/${relationId}/memory`,
  );
  return data;
}

// ─── Mission ────────────────────────────────────────────────────────────────────

export async function createTodakMission(
  relationId: number,
  body: ApiMissionInput,
): Promise<{ missionId: number }> {
  const { data } = await apiClient.post<{ missionId: number }>(
    `/todak/mission/${relationId}`,
    body,
  );
  return data;
}

export async function completeTodakMission(missionId: number): Promise<void> {
  await apiClient.post(`/todak/mission/${missionId}/complete`);
}

export async function deleteTodakMission(missionId: number): Promise<void> {
  await apiClient.delete(`/todak/mission/${missionId}`);
}

export async function updateTodakMission(
  missionId: number,
  body: ApiMissionInput,
): Promise<void> {
  await apiClient.patch(`/todak/mission/${missionId}`, body);
}

// ─── Mission Request (조르기) ────────────────────────────────────────────────────

export async function getMissionRequests(
  relationId: number,
): Promise<ApiMissionRequestListResponse> {
  const { data } = await apiClient.get<ApiMissionRequestListResponse>(
    `/todak/mission-request/${relationId}`,
  );
  return data;
}

export async function acceptMissionRequest(missionRequestId: number): Promise<void> {
  await apiClient.post(`/todak/mission-request/${missionRequestId}/accept`);
}

export async function rejectMissionRequest(missionRequestId: number): Promise<void> {
  await apiClient.post(`/todak/mission-request/${missionRequestId}/reject`);
}
