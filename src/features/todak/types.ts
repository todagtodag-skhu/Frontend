export type BoardDesignApi = 'TIGER' | 'PANDA' | 'CAT';
export type StickerCountApi = 'TWENTY' | 'THIRTY' | 'FIFTY';

export interface ApiMission {
  missionId: number;
  name: string;
  emoticon: string;
  rewardStickerCount: number;
  targetCount: number;
  isRequested: boolean;
}

export interface ApiStickerBoard {
  stickerBoardId: number;
  name: string;
  remainingStickerCount: string;
  boardDesign: BoardDesignApi;
  finalReward: string;
  missions: ApiMission[];
}

export interface ApiMissionInput {
  name: string;
  emoticon: string;
  rewardStickerCount: number;
  targetCount: number;
}

export interface ApiCreateStickerBoardRequest {
  name: string;
  stickerCount: StickerCountApi;
  boardDesign: BoardDesignApi;
  missions: ApiMissionInput[];
  finalReward: string;
}

export interface ApiUpdateStickerBoardRequest {
  name: string;
  stickerCount: StickerCountApi;
  boardDesign: BoardDesignApi;
  finalReward: string;
}

export interface ApiMissionRequest {
  missionRequestId: number;
  missionId: number;
  missionName: string;
  emoticon: string;
  rewardStickerCount?: number;
  requestedAt?: string;
}

export interface ApiMissionRequestListResponse {
  requests?: ApiMissionRequest[];
  currentRequests?: ApiMissionRequest[];
  previousRequests?: ApiMissionRequest[];
}

export interface ApiSticker {
  stickerId: number;
  position: number;
  date: string;
  content: string;
}

export interface ApiCompletedBoard {
  name: string;
  stickers: ApiSticker[];
  finalReward: string;
}

export interface ApiMemoryStorageResponse {
  stickerBoards: ApiCompletedBoard[];
}

export interface ApiGiveStickerRequest {
  content: string | null;
  emoticon: string;
}
