export type Mission = {
  id: string;
  emoji: string;
  title: string;
  days: string;
  frequency: string;
  completionCount?: number;
  stickerPerCompletion?: number;
  isRequested?: boolean;
};

export type StickerRequest = {
  id: string;
  missionId: string;
  missionEmoji: string;
  missionTitle: string;
  stickerCount: number;
  requestedAt: string; // e.g. "오늘 오전 9:15"
};

export type ChildProfile = {
  id: string;
  inviteCode: string;
  name: string;
  birthday: string;
};

export type StickerBoard = {
  id: string;
  childId: string;
  title: string;
  stickerCount: string;
  currentStickerCount?: string;
  remainingStickerCount?: string;
  boardDesign: string;
  rewardText: string;
  missions: Mission[];
};
