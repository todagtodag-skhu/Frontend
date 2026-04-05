import { Mission, StickerBoard } from '@/components/todagi/types';
import { MOCK_STICKER_BOARDS } from '@/mocks/data';

// 실제 API 연동 시 fetch 호출로 교체

export type CreateStickerBoardInput = {
  childId: string;
  title: string;
  stickerCount: string;
  boardDesign: string;
  rewardText: string;
  missions: Mission[];
};

export async function getStickerBoards(): Promise<StickerBoard[]> {
  return structuredClone(MOCK_STICKER_BOARDS);
}

export async function createStickerBoard(input: CreateStickerBoardInput): Promise<StickerBoard> {
  return {
    id: `board-${Date.now()}`,
    childId: input.childId,
    title: input.title,
    stickerCount: input.stickerCount,
    boardDesign: input.boardDesign,
    rewardText: input.rewardText,
    missions: input.missions,
  };
}

export async function updateStickerBoard(
  boardId: string,
  input: CreateStickerBoardInput
): Promise<StickerBoard> {
  return {
    id: boardId,
    childId: input.childId,
    title: input.title,
    stickerCount: input.stickerCount,
    boardDesign: input.boardDesign,
    rewardText: input.rewardText,
    missions: input.missions,
  };
}

export async function deleteStickerBoard(_boardId: string): Promise<void> {
  // no-op in mock
}
