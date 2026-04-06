import { ChildProfile, StickerBoard } from '@/components/todagi/types';

import {
  cloneStickerBoard,
  completedStickerBoardMocks,
  defaultTreeMissionMocks,
  growthMockChildren,
  growthMockStickerBoards,
  type CompletedStickerBoard,
  type TreeMission,
} from '@/mocks/growth';

type GrowthSeedData = {
  children: ChildProfile[];
  stickerBoards: StickerBoard[];
  activeBoardId?: string;
};

function cloneChildProfile(child: ChildProfile): ChildProfile {
  return { ...child };
}

function cloneCompletedStickerBoard(board: CompletedStickerBoard): CompletedStickerBoard {
  return {
    ...board,
    stickers: [...board.stickers],
  };
}

function cloneTreeMission(mission: TreeMission): TreeMission {
  return { ...mission };
}

export function getGrowthSeedData(): GrowthSeedData {
  const stickerBoards = growthMockStickerBoards.map(cloneStickerBoard);

  return {
    children: growthMockChildren.map(cloneChildProfile),
    stickerBoards,
    activeBoardId: stickerBoards[0]?.id,
  };
}

export function getStickerBoardDefaultMissions(boardId: string): StickerBoard['missions'] {
  const board = growthMockStickerBoards.find((item) => item.id === boardId);

  return board ? board.missions.map((mission) => ({ ...mission })) : [];
}

export function getCompletedStickerBoards(): CompletedStickerBoard[] {
  return completedStickerBoardMocks.map(cloneCompletedStickerBoard);
}

export function getDefaultTreeMissions(): TreeMission[] {
  return defaultTreeMissionMocks.map(cloneTreeMission);
}
