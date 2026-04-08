import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';

import { Mission, StickerBoard, ChildProfile } from '@/components/todagi/types';
import * as childrenApi from '@/features/children/api';
import * as stickerBoardApi from '@/features/stickerboard/api';
import { useAuthSession } from '@/features/auth/session';

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

export type GrowthContextValue = {
  children: ChildProfile[];
  stickerBoards: StickerBoard[];
  activeBoardId?: string;
  activeStickerBoard?: StickerBoard;
  addChild: (input: AddChildInput) => Promise<string>;
  updateChild: (childId: string, input: AddChildInput) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;
  addStickerBoard: (input: AddStickerBoardInput) => Promise<string>;
  updateStickerBoard: (boardId: string, input: AddStickerBoardInput) => Promise<void>;
  deleteStickerBoard: (boardId: string) => Promise<void>;
  setActiveBoardId: (boardId?: string) => void;
  getChildById: (childId?: string) => ChildProfile | undefined;
  getBoardById: (boardId?: string) => StickerBoard | undefined;
  getBoardByChildId: (childId?: string) => StickerBoard | undefined;
  getBoardsByChildId: (childId?: string) => StickerBoard[];
};

const GrowthContext = createContext<GrowthContextValue | undefined>(undefined);

export function GrowthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { data: session } = useAuthSession();
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [boards, setBoards] = useState<StickerBoard[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const loadGrowthData = async () => {
      const isGrowthRoute = segments[0] === '(growth)';

      console.log('[GrowthContext] segments:', segments[0], 'role:', session?.role);

      if (session?.role === 'PENDING') {
        if (segments[0] !== 'onboarding') {
          router.replace('/onboarding');
        }
        return;
      }

      if (session?.role === 'SUNGJANG') {
        if (!isGrowthRoute) {
          console.log('[GrowthContext] SUNGJANG → /(growth)/tree로 이동');
          router.replace('/(growth)/tree');
        }
        return;
      }

      if (session?.role !== 'TODAGI') {
        console.log('[GrowthContext] role 없음, 데이터 로딩 스킵');
        return;
      }

      console.log('[GrowthContext] TODAGI → 데이터 로딩 시작');
      try {
        const [fetchedChildren, fetchedBoards] = await Promise.all([
          childrenApi.getChildren(),
          stickerBoardApi.getStickerBoards(),
        ]);

        if (cancelled) {
          return;
        }

        console.log('[GrowthContext] 데이터 로딩 완료 - children:', fetchedChildren.length, 'boards:', fetchedBoards.length);
        setChildProfiles(fetchedChildren);
        setBoards(fetchedBoards);
        setActiveBoardId((prev) => prev ?? fetchedBoards[0]?.id);
      } catch (error) {
        console.error('[GrowthContext] 데이터 로딩 실패:', error);
      }
    };

    loadGrowthData();

    return () => {
      cancelled = true;
    };
  }, [router, segments, session]);

  const value = useMemo<GrowthContextValue>(() => ({
    children: childProfiles,
    stickerBoards: boards,
    activeBoardId,
    activeStickerBoard: boards.find((board) => board.id === activeBoardId) ?? boards[0],
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
      setActiveBoardId(newBoard.id);
      return newBoard.id;
    },
    updateStickerBoard: async (boardId, input) => {
      const updated = await stickerBoardApi.updateStickerBoard(boardId, input);
      setBoards((prev) =>
        prev.map((board) => (board.id === boardId ? updated : board))
      );
      setActiveBoardId(boardId);
    },
    deleteStickerBoard: async (boardId) => {
      await stickerBoardApi.deleteStickerBoard(boardId);
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
    getBoardByChildId: (childId) => boards.find((board) => board.childId === childId),
    getBoardsByChildId: (childId) => boards.filter((board) => board.childId === childId),
  }), [activeBoardId, boards, childProfiles]);

  return <GrowthContext.Provider value={value}>{children}</GrowthContext.Provider>;
}

export function useGrowth(): GrowthContextValue {
  const context = useContext(GrowthContext);

  if (!context) {
    throw new Error('useGrowth must be used within a GrowthProvider');
  }

  return context;
}
