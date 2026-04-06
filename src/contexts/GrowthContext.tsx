import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { Mission, StickerBoard, ChildProfile } from '@/components/todagi/types';
import { getGrowthSeedData, getStickerBoardDefaultMissions } from '@/features/growth/data';

type AddChildInput = {
  inviteCode: string;
  name: string;
  birthday: string;
};

type AddStickerBoardInput = {
  childId: string;
  title: string;
  stickerCount: string;
  boardDesign: string;
  rewardText: string;
  missions: Mission[];
};

type GrowthContextValue = {
  children: ChildProfile[];
  stickerBoards: StickerBoard[];
  activeBoardId?: string;
  activeStickerBoard?: StickerBoard;
  addChild: (input: AddChildInput) => string;
  updateChild: (childId: string, input: AddChildInput) => void;
  deleteChild: (childId: string) => void;
  addStickerBoard: (input: AddStickerBoardInput) => void;
  updateStickerBoard: (boardId: string, input: AddStickerBoardInput) => void;
  deleteStickerBoard: (boardId: string) => void;
  setActiveBoardId: (boardId?: string) => void;
  getChildById: (childId?: string) => ChildProfile | undefined;
  getBoardById: (boardId?: string) => StickerBoard | undefined;
  getBoardsByChildId: (childId?: string) => StickerBoard[];
};

const initialGrowthData = getGrowthSeedData();
const BOARD_1_DEFAULT_MISSIONS: Mission[] = getStickerBoardDefaultMissions('board-1');

const GrowthContext = createContext<GrowthContextValue | null>(null);

export function GrowthProvider({ children }: { children: ReactNode }) {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>(initialGrowthData.children);
  const [boards, setBoards] = useState<StickerBoard[]>(initialGrowthData.stickerBoards);
  const [activeBoardId, setActiveBoardId] = useState<string | undefined>(initialGrowthData.activeBoardId);

  useEffect(() => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === 'board-1' && board.missions.length < BOARD_1_DEFAULT_MISSIONS.length
          ? {
              ...board,
              missions: BOARD_1_DEFAULT_MISSIONS,
            }
          : board
      )
    );
  }, []);

  const value = useMemo<GrowthContextValue>(() => ({
    children: childProfiles,
    stickerBoards: boards,
    activeBoardId,
    activeStickerBoard: boards.find((board) => board.id === activeBoardId) ?? boards[0],
    addChild: (input) => {
      const childId = `child-${Date.now()}`;
      const nextChild: ChildProfile = {
        id: childId,
        inviteCode: input.inviteCode,
        name: input.name,
        birthday: input.birthday,
      };

      setChildProfiles((prev) => [...prev, nextChild]);
      return childId;
    },
    updateChild: (childId, input) => {
      setChildProfiles((prev) =>
        prev.map((child) =>
          child.id === childId
            ? {
                ...child,
                inviteCode: input.inviteCode,
                name: input.name,
                birthday: input.birthday,
              }
            : child
        )
      );
    },
    deleteChild: (childId) => {
      setChildProfiles((prev) => prev.filter((child) => child.id !== childId));
      setBoards((prev) => prev.filter((board) => board.childId !== childId));
    },
    addStickerBoard: (input) => {
      const nextBoard: StickerBoard = {
        id: `board-${Date.now()}`,
        childId: input.childId,
        title: input.title,
        stickerCount: input.stickerCount,
        boardDesign: input.boardDesign,
        rewardText: input.rewardText,
        missions: input.missions,
      };

      setBoards((prev) => [...prev, nextBoard]);
      setActiveBoardId(nextBoard.id);
    },
    updateStickerBoard: (boardId, input) => {
      setBoards((prev) =>
        prev.map((board) =>
          board.id === boardId
            ? {
                ...board,
                childId: input.childId,
                title: input.title,
                stickerCount: input.stickerCount,
                boardDesign: input.boardDesign,
                rewardText: input.rewardText,
                missions: input.missions,
              }
            : board
        )
      );
      setActiveBoardId(boardId);
    },
    deleteStickerBoard: (boardId) => {
      setBoards((prev) => {
        const nextBoards = prev.filter((board) => board.id !== boardId);

        if (activeBoardId === boardId) {
          setActiveBoardId(nextBoards[0]?.id);
        }

        return nextBoards;
      });
    },
    setActiveBoardId,
    getChildById: (childId) => childProfiles.find((child) => child.id === childId),
    getBoardById: (boardId) => boards.find((board) => board.id === boardId),
    getBoardsByChildId: (childId) => boards.filter((board) => board.childId === childId),
  }), [activeBoardId, boards, childProfiles]);

  return <GrowthContext.Provider value={value}>{children}</GrowthContext.Provider>;
}

export function useGrowth() {
  const context = useContext(GrowthContext);

  if (!context) {
    throw new Error('useGrowth must be used within a GrowthProvider');
  }

  return context;
}
