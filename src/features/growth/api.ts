import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

import { type Mission } from '@/components/todagi/types';
import { clearAuthSession, getAuthSession } from '@/features/auth/session';
import { type CompletedStickerBoard } from '@/mocks/data';

export type GrowthStickerPlacement = {
  id: string;
  cellId: number;
  missionId: string;
  emoji: string;
  title: string;
};

export type GrowthAvailableSticker = {
  id: string;
  missionId: string;
  emoji: string;
  title: string;
};

export type GrowthStickerBoard = {
  id: string;
  title: string;
  rewardText: string;
  boardDesign: string;
  stickerCount: string;
  totalSpots: number;
  remainingSpots: number;
  missions: Mission[];
  placedStickers: GrowthStickerPlacement[];
  availableStickers: GrowthAvailableSticker[];
};

const BOARD_DESIGN_MAP: Record<string, string> = {
  '성장 나무': 'foxImage',
  '우주 탐험': 'meowImage',
  '바다 여행': 'tigerImage',
  '래서판다': 'foxImage',
  '고양이': 'meowImage',
  '호랑이': 'tigerImage',
  PANDA: 'foxImage',
  CAT: 'meowImage',
  TIGER: 'tigerImage',
  foxImage: 'foxImage',
  meowImage: 'meowImage',
  tigerImage: 'tigerImage',
};

function parseJsonMaybe(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function unwrapData<T>(value: unknown): T | null {
  const parsed = parseJsonMaybe(value);

  if (!parsed || typeof parsed !== 'object') {
    return parsed as T | null;
  }

  if ('data' in parsed) {
    return (parsed as { data?: T }).data ?? null;
  }

  return parsed as T;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asIdentifier(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function parseCountValue(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value && typeof value === 'object') {
    const record = asRecord(value);

    if (record) {
      return (
        parseCountValue(record.count) ||
        parseCountValue(record.value) ||
        parseCountValue(record.label) ||
        parseCountValue(record.name) ||
        parseCountValue(record.type) ||
        parseCountValue(record.stickerCount) ||
        parseCountValue(record.remainingStickerCount)
      );
    }
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();

    if (normalized === 'TWENTY') {
      return 20;
    }

    if (normalized === 'THIRTY') {
      return 30;
    }

    if (normalized === 'FIFTY') {
      return 50;
    }

    const matched = value.match(/\d+/);
    if (matched) {
      return Number.parseInt(matched[0], 10);
    }
  }

  return 0;
}

function extractApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }

  if ('error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }

  return null;
}

function getApiBaseUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_URL이 설정되어 있지 않습니다.');
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

async function requireAuthSession() {
  const session = await getAuthSession();

  if (!session?.accessToken) {
    throw new Error('로그인이 필요합니다.');
  }

  return session;
}

let apiClient: ReturnType<typeof axios.create> | null = null;

function getApiClient() {
  if (apiClient) {
    return apiClient;
  }

  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  });

  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const session = await getAuthSession();

    if (session?.accessToken) {
      const headers = AxiosHeaders.from(config.headers ?? {});

      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
      }

      config.headers = headers;
    }

    return config;
  });

  client.interceptors.response.use(async (response) => {
    if (response.status !== 401) {
      return response;
    }

    await clearAuthSession();
    router.replace('/login');
    return response;
  });

  apiClient = client;
  return client;
}

function assertOkStatus(response: { status: number; data: unknown }, fallbackMessage: string) {
  if (response.status < 200 || response.status >= 300) {
    const message =
      extractApiErrorMessage(parseJsonMaybe(response.data)) ||
      `${fallbackMessage} (${response.status})`;
    throw new Error(message);
  }
}

function getStickerCountLabel(totalSpots: number, rawValue?: string) {
  if (rawValue) {
    return rawValue;
  }

  return totalSpots > 0 ? `${totalSpots}개` : '0개';
}

function normalizeBoardDesign(value: unknown, fallback = 'foxImage') {
  const boardDesign = asString(value);

  if (!boardDesign) {
    return fallback;
  }

  return BOARD_DESIGN_MAP[boardDesign] ?? fallback;
}

function normalizeMission(value: unknown, index: number): Mission {
  const item = asRecord(value);

  return {
    id: asIdentifier(item?.missionId) || asIdentifier(item?.id) || `mission-${index + 1}`,
    emoji:
      asString(item?.emoji) ||
      asString(item?.stickerEmoji) ||
      asString(item?.icon) ||
      asString(item?.emoticon) ||
      '⭐',
    title:
      asString(item?.title) ||
      asString(item?.missionTitle) ||
      asString(item?.name) ||
      `미션 ${index + 1}`,
    days: asString(item?.days) || asString(item?.dayOfWeeks),
    frequency: asString(item?.frequency) || asString(item?.frequencyText) || asString(item?.cycle) || '하루 1회',
    completionCount:
      typeof item?.completionCount === 'number'
        ? item.completionCount
        : typeof item?.targetCount === 'number'
        ? item.targetCount
        : undefined,
    stickerPerCompletion:
      typeof item?.stickerPerCompletion === 'number'
        ? item.stickerPerCompletion
        : typeof item?.rewardStickerCount === 'number'
        ? item.rewardStickerCount
        : undefined,
    isRequested: typeof item?.isRequested === 'boolean' ? item.isRequested : undefined,
  };
}

function normalizePlacedStickers(value: unknown, missions: Mission[]): GrowthStickerPlacement[] {
  const missionMap = new Map(missions.map((mission) => [mission.id, mission]));

  return asArray(value)
    .map((item, index) => {
      const record = asRecord(item);
      const nestedMission = asRecord(record?.mission);
      const missionId =
        asIdentifier(record?.missionId) ||
        asIdentifier(record?.id) ||
        asIdentifier(record?.stickerId) ||
        asIdentifier(nestedMission?.id);
      const mission = missionMap.get(missionId);
      const cellId =
        parseCountValue(record?.cellId) ||
        parseCountValue(record?.position) ||
        parseCountValue(record?.slot);

      return {
        id:
          asIdentifier(record?.stickerId) ||
          asIdentifier(record?.id) ||
          `placed-sticker-${index + 1}`,
        cellId,
        missionId: missionId || mission?.id || `mission-${index + 1}`,
        emoji:
          asString(record?.emoji) ||
          asString(record?.stickerEmoji) ||
          asString(record?.missionEmoji) ||
          mission?.emoji ||
          '⭐',
        title:
          asString(record?.title) ||
          asString(record?.missionTitle) ||
          mission?.title ||
          `스티커 ${index + 1}`,
      };
    })
    .filter((sticker) => sticker.cellId > 0)
    .sort((left, right) => left.cellId - right.cellId);
}

function normalizeAvailableStickers(value: unknown, missions: Mission[]): GrowthAvailableSticker[] {
  const missionMap = new Map(missions.map((mission) => [mission.id, mission]));

  return asArray(value)
    .map((item, index) => {
      const record = asRecord(item);
      const nestedMission = asRecord(record?.mission);
      const missionId =
        asIdentifier(record?.missionId) ||
        asIdentifier(record?.id) ||
        asIdentifier(record?.stickerId) ||
        asIdentifier(nestedMission?.id) ||
        `available-mission-${index + 1}`;
      const mission = missionMap.get(missionId);
      const position =
        parseCountValue(record?.position) ||
        parseCountValue(record?.cellId) ||
        parseCountValue(record?.slot);

      return {
        id:
          asIdentifier(record?.stickerId) ||
          asIdentifier(record?.id) ||
          asIdentifier(record?.missionRequestId) ||
          `available-sticker-${index + 1}`,
        missionId,
        emoji:
          asString(record?.emoji) ||
          asString(record?.stickerEmoji) ||
          asString(record?.missionEmoji) ||
          asString(record?.emoticon) ||
          mission?.emoji ||
          '⭐',
        title:
          asString(record?.title) ||
          asString(record?.missionTitle) ||
          asString(record?.content) ||
          mission?.title ||
          `스티커 ${index + 1}`,
        position,
      };
    })
    .filter((sticker) => Boolean(sticker.id) && (!sticker.position || sticker.position <= 0))
    .map(({ position: _position, ...sticker }) => sticker);
}

function normalizeGrowthBoard(value: unknown): GrowthStickerBoard | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const missionSource =
    record.missions ??
    record.missionList ??
    record.availableMissions ??
    record.todoMissions;
  const missions = asArray(missionSource).map(normalizeMission);
  const availableStickerSource =
    record.availableStickers ??
    record.pendingStickers ??
    record.receivedStickers ??
    record.stickerQueue ??
    record.attachableStickers;
  const stickerSource = record.stickers;
  const totalSpots =
    parseCountValue(record.totalSpots) ||
    parseCountValue(record.totalStickerCount) ||
    parseCountValue(record.stickerTotalCount) ||
    parseCountValue(record.stickerCount) ||
    parseCountValue(record.stickerCountLabel) ||
    parseCountValue(record.remainingStickerCount) ||
    parseCountValue(record.maxCount) ||
    parseCountValue(record.maxStickerCount) ||
    parseCountValue(record.goalCount) ||
    parseCountValue(record.stickerGoalCount);
  const remainingSpots =
    parseCountValue(record.remainingStickerCount) ||
    parseCountValue(record.remainingCount) ||
    parseCountValue(record.leftStickerCount) ||
    Math.max(totalSpots, 0);
  const placedStickers = normalizePlacedStickers(
    stickerSource ??
      record.placedStickers ??
      record.attachedStickers ??
      record.completedMissions,
    missions,
  );
  const availableStickers = normalizeAvailableStickers(
    availableStickerSource ??
      stickerSource,
    missions,
  );

  return {
    id: asIdentifier(record.stickerBoardId) || asIdentifier(record.id) || 'growth-board',
    title:
      asString(record.title) ||
      asString(record.stickerBoardTitle) ||
      asString(record.boardName) ||
      asString(record.name) ||
      '스티커판',
    rewardText:
      asString(record.rewardText) ||
      asString(record.reward) ||
      asString(record.rewardName) ||
      asString(record.finalReward),
    boardDesign: normalizeBoardDesign(record.boardDesign ?? record.design),
    stickerCount: getStickerCountLabel(totalSpots, asString(record.stickerCountLabel)),
    totalSpots,
    remainingSpots,
    missions,
    placedStickers,
    availableStickers,
  };
}

function normalizeCompletedBoard(value: unknown, index: number): CompletedStickerBoard | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  return {
    id: asIdentifier(record.stickerBoardId) || asIdentifier(record.id) || `completed-board-${index + 1}`,
    title:
      asString(record.title) ||
      asString(record.stickerBoardTitle) ||
      `완성된 스티커판 ${index + 1}`,
    reward:
      asString(record.reward) ||
      asString(record.rewardText) ||
      asString(record.rewardName),
    boardDesign: normalizeBoardDesign(record.boardDesign ?? record.design),
    stickers: asArray(record.stickers ?? record.placedStickers ?? record.memories).map(
      (sticker, stickerIndex) => {
        const item = asRecord(sticker);

        return {
          emoji:
            asString(item?.emoji) ||
            asString(item?.stickerEmoji) ||
            asString(item?.missionEmoji) ||
            '⭐',
          title:
            asString(item?.title) ||
            asString(item?.missionTitle) ||
            `스티커 ${stickerIndex + 1}`,
        };
      },
    ),
  };
}

export async function getGrowthStickerBoard(): Promise<GrowthStickerBoard> {
  await requireAuthSession();

  const response = await getApiClient().get('/sungjang/sticker-board');
  assertOkStatus(response, '성장이 스티커판을 불러오지 못했습니다.');
  console.log('[growth] /sungjang/sticker-board raw response', response.data);

  const unwrappedPayload = unwrapData(response.data);
  console.log('[growth] /sungjang/sticker-board unwrapped payload', unwrappedPayload);

  const board = normalizeGrowthBoard(unwrappedPayload);
  console.log('[growth] normalized sticker board', board);

  if (!board) {
    throw new Error('성장이 스티커판 응답이 올바르지 않습니다.');
  }

  return board;
}

export async function requestMissionSticker(missionId: string): Promise<void> {
  await requireAuthSession();

  const response = await getApiClient().post(`/sungjang/mission-request/${missionId}`);
  assertOkStatus(response, '스티커 요청에 실패했습니다.');
}

export async function attachGrowthSticker(position: number): Promise<GrowthStickerBoard> {
  await requireAuthSession();

  const response = await getApiClient().post('/sungjang/sticker/attach', {
    position,
  });
  assertOkStatus(response, '스티커 부착에 실패했습니다.');

  return getGrowthStickerBoard();
}

export async function getCompletedGrowthStickerBoards(): Promise<CompletedStickerBoard[]> {
  await requireAuthSession();

  const response = await getApiClient().get('/sungjang/sticker-board/memory');
  assertOkStatus(response, '완성된 스티커판을 불러오지 못했습니다.');

  const payload = unwrapData<unknown>(response.data);
  const boards = asArray(payload)
    .map(normalizeCompletedBoard)
    .filter((board): board is CompletedStickerBoard => Boolean(board));

  if (boards.length === 0) {
    throw new Error('아직 완성된 스티커판이 없어요!');
  }

  return boards;
}
