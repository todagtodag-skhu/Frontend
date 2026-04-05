import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { Mission, StickerBoard, ChildProfile } from '@/components/todagi/types';
import * as childrenApi from '@/features/children/api';
import * as stickerBoardApi from '@/features/stickerboard/api';

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
  addChild: (input: AddChildInput) => Promise<string>;
  updateChild: (childId: string, input: AddChildInput) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;
  addStickerBoard: (input: AddStickerBoardInput) => Promise<string>;
  updateStickerBoard: (boardId: string, input: AddStickerBoardInput) => Promise<void>;
  deleteStickerBoard: (boardId: string) => Promise<void>;
  getChildById: (childId?: string) => ChildProfile | undefined;
  getBoardById: (boardId?: string) => StickerBoard | undefined;
  getBoardByChildId: (childId?: string) => StickerBoard | undefined;
  getBoardsByChildId: (childId?: string) => StickerBoard[];
};

const GrowthContext = createContext<GrowthContextValue | null>(null);

export function GrowthProvider({ children }: { children: ReactNode }) {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [boards, setBoards] = useState<StickerBoard[]>([]);

  useEffect(() => {
    Promise.all([childrenApi.getChildren(), stickerBoardApi.getStickerBoards()]).then(
      ([fetchedChildren, fetchedBoards]) => {
        setChildProfiles(fetchedChildren);
        setBoards(fetchedBoards);
      }
    );
  }, []);

  const value = useMemo<GrowthContextValue>(() => ({
    children: childProfiles,
    stickerBoards: boards,
    addChild: async (input) => {
      const newChild = await childrenApi.createChild(input);
      setChildProfiles((prev) => [...prev, newChild]);
      return newChild.id;
    },
    updateChild: async (childId, input) => {
      const updated = await childrenApi.updateChild(childId, input);
      setChildProfiles((prev) =>
        prev.map((child) => (child.id === childId ? updated : child))
      );
    },
    deleteChild: async (childId) => {
      await childrenApi.deleteChild(childId);
      setChildProfiles((prev) => prev.filter((child) => child.id !== childId));
      setBoards((prev) => prev.filter((board) => board.childId !== childId));
    },
    addStickerBoard: async (input) => {
      const newBoard = await stickerBoardApi.createStickerBoard(input);
      setBoards((prev) => [...prev, newBoard]);
      return newBoard.id;
    },
    updateStickerBoard: async (boardId, input) => {
      const updated = await stickerBoardApi.updateStickerBoard(boardId, input);
      setBoards((prev) =>
        prev.map((board) => (board.id === boardId ? updated : board))
      );
    },
    deleteStickerBoard: async (boardId) => {
      await stickerBoardApi.deleteStickerBoard(boardId);
      setBoards((prev) => prev.filter((board) => board.id !== boardId));
    },
    getChildById: (childId) => childProfiles.find((child) => child.id === childId),
    getBoardById: (boardId) => boards.find((board) => board.id === boardId),
    getBoardByChildId: (childId) => boards.find((board) => board.childId === childId),
    getBoardsByChildId: (childId) => boards.filter((board) => board.childId === childId),
  }), [boards, childProfiles]);

  return <GrowthContext.Provider value={value}>{children}</GrowthContext.Provider>;
}

export function useGrowth() {
  const context = useContext(GrowthContext);

  if (!context) {
    throw new Error('useGrowth must be used within a GrowthProvider');
  }

  return context;
}
