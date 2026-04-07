import { ChildProfile, StickerBoard } from '@/components/todagi/types';

import {
  cloneStickerBoard,
  MOCK_CHILDREN,
  MOCK_COMPLETED_STICKER_BOARDS,
  MOCK_DEFAULT_TREE_MISSIONS,
  MOCK_STICKER_BOARDS,
  type CompletedStickerBoard,
  type TreeMission,
} from '@/mocks/data';

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
    stickers: board.stickers.map((sticker) => ({ ...sticker })),
  };
}

function cloneTreeMission(mission: TreeMission): TreeMission {
  return { ...mission };
}

export function getGrowthSeedData(): GrowthSeedData {
  const stickerBoards = MOCK_STICKER_BOARDS.map(cloneStickerBoard);

  return {
    children: MOCK_CHILDREN.map(cloneChildProfile),
    stickerBoards,
    activeBoardId: stickerBoards[0]?.id,
  };
}

export function getStickerBoardDefaultMissions(boardId: string): StickerBoard['missions'] {
  const board = MOCK_STICKER_BOARDS.find((item) => item.id === boardId);

  return board ? board.missions.map((mission) => ({ ...mission })) : [];
}

export function getCompletedStickerBoards(): CompletedStickerBoard[] {
  return MOCK_COMPLETED_STICKER_BOARDS.map(cloneCompletedStickerBoard);
}

export function getDefaultTreeMissions(): TreeMission[] {
  return MOCK_DEFAULT_TREE_MISSIONS.map(cloneTreeMission);
}
