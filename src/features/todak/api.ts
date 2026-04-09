import { apiClient } from '@/lib/apiClient';
import { Mission, StickerBoard } from '@/components/todagi/types';
import type { CompletedStickerBoard } from '@/mocks/data';
import type {
  ApiMission,
  ApiMissionRequest,
  ApiStickerBoard,
  ApiMissionInput,
  ApiCreateStickerBoardRequest,
  ApiUpdateStickerBoardRequest,
  ApiMissionRequestListResponse,
  ApiMemoryStorageResponse,
  ApiCompletedBoard,
  BoardDesignApi,
  StickerCountApi,
  ApiGiveStickerRequest,
} from './types';
import type { StickerRequest } from '@/components/todagi/types';

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

export const STICKER_COUNT_FROM_API: Record<StickerCountApi, string> = {
  TWENTY: '20개',
  THIRTY: '30개',
  FIFTY: '50개',
};

export function isStickerCountLabel(value?: string | null): value is string {
  return !!value && Object.values(STICKER_COUNT_FROM_API).includes(value);
}

export function formatStickerCountLabel(value?: string | null): string {
  if (!value) return '';

  if (value in STICKER_COUNT_FROM_API) {
    return STICKER_COUNT_FROM_API[value as StickerCountApi];
  }

  if (value.endsWith('개')) {
    return value;
  }

  const numericValue = value.replace(/[^0-9]/g, '');
  return numericValue ? `${numericValue}개` : value;
}

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
    isRequested: m.isRequested,
  };
}

export function adaptApiStickerBoard(
  board: ApiStickerBoard,
  relationId: number,
  _previousBoard?: StickerBoard | null,
): StickerBoard {
  // API returns remainingStickerCount as "given/total" format (e.g. "2/50")
  const progressMatch = board.remainingStickerCount?.match(/^(\d+)\/(\d+)$/);
  const stickerCount = progressMatch
    ? `${progressMatch[2]}개`
    : formatStickerCountLabel(board.remainingStickerCount);
  const remainingStickerCount = progressMatch
    ? String(Number(progressMatch[2]) - Number(progressMatch[1]))
    : board.remainingStickerCount;

  return {
    id: board.stickerBoardId.toString(),
    childId: relationId.toString(),
    title: board.name,
    stickerCount,
    remainingStickerCount,
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

export function adaptApiMissionRequest(request: ApiMissionRequest): StickerRequest {
  return {
    id: request.missionRequestId.toString(),
    missionId: request.missionId.toString(),
    missionEmoji: request.emoticon,
    missionTitle: request.missionName,
    stickerCount: request.rewardStickerCount ?? 1,
    requestedAt: request.requestedAt ?? '',
  };
}

export function adaptApiMissionRequests(response: ApiMissionRequestListResponse): {
  requests: StickerRequest[];
  previousRequests: StickerRequest[];
} {
  const requests = (response.currentRequests ?? response.requests ?? []).map(adaptApiMissionRequest);
  const previousRequests = (response.previousRequests ?? []).map(adaptApiMissionRequest);

  return {
    requests,
    previousRequests,
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

export async function completeTodakStickerBoard(stickerBoardId: number): Promise<void> {
  await apiClient.post(`/todak/sticker-board/${stickerBoardId}/complete`);
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
): Promise<{ requests: StickerRequest[]; previousRequests: StickerRequest[] }> {
  const { data } = await apiClient.get<ApiMissionRequestListResponse>(
    `/todak/mission-request/${relationId}`,
  );
  return adaptApiMissionRequests(data);
}

export async function acceptMissionRequest(missionRequestId: number): Promise<void> {
  await apiClient.post(`/todak/mission-request/${missionRequestId}/accept`);
}

export async function rejectMissionRequest(missionRequestId: number): Promise<void> {
  await apiClient.post(`/todak/mission-request/${missionRequestId}/reject`);
}

// ─── Sticker (수동 부여) ────────────────────────────────────────────────────────

export async function giveTodakSticker(
  relationId: number,
  body: ApiGiveStickerRequest,
): Promise<void> {
  await apiClient.post(`/todak/sticker/give/${relationId}`, body);
}
