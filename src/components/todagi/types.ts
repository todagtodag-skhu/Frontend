export type Mission = {
  id: string;
  emoji: string;
  title: string;
  days: string;
  frequency: string;
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
  boardDesign: string;
  rewardText: string;
  missions: Mission[];
};
