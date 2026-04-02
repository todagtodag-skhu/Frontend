import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { Mission, StickerBoard, ChildProfile } from '@/components/todagi/types';

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
  addChild: (input: AddChildInput) => string;
  updateChild: (childId: string, input: AddChildInput) => void;
  deleteChild: (childId: string) => void;
  addStickerBoard: (input: AddStickerBoardInput) => void;
  updateStickerBoard: (boardId: string, input: AddStickerBoardInput) => void;
  deleteStickerBoard: (boardId: string) => void;
  getChildById: (childId?: string) => ChildProfile | undefined;
  getBoardById: (boardId?: string) => StickerBoard | undefined;
  getBoardsByChildId: (childId?: string) => StickerBoard[];
};

const initialChildren: ChildProfile[] = [
  {
    id: 'child-1',
    inviteCode: '123456',
    name: '유지니유진',
    birthday: '2020.03.04',
  },
  {
    id: 'child-2',
    inviteCode: '234567',
    name: '우럭이우럭',
    birthday: '2019.10.12',
  },
  {
    id: 'child-3',
    inviteCode: '345678',
    name: '시어니시연',
    birthday: '2021.01.08',
  },
];

const initialStickerBoards: StickerBoard[] = [
  {
    id: 'board-1',
    childId: 'child-1',
    title: '유지니유진의 성장나무',
    stickerCount: '20개',
    boardDesign: '성장 나무',
    rewardText: '주말에 키즈카페 가기',
    missions: [
      {
        id: 'mission-1',
        emoji: '🪥',
        title: '양치하기',
        days: '월,화,수,목,금',
        frequency: '하루 2회',
      },
      {
        id: 'mission-1-1',
        emoji: '🪥',
        title: '밥먹기',
        days: '월,화,수,목,금',
        frequency: '하루 2회',
      },
      {
        id: 'mission-1-2',
        emoji: '🪥',
        title: '청소하기',
        days: '월,화,수,목,금',
        frequency: '하루 2회',
      },
    ],
  },
  {
    id: 'board-2',
    childId: 'child-1',
    title: '유지니유진의 책 읽기판',
    stickerCount: '30개',
    boardDesign: '우주 탐험',
    rewardText: '새 그림책 고르기',
    missions: [
      {
        id: 'mission-2',
        emoji: '📚',
        title: '책 읽기',
        days: '월,수,금',
        frequency: '하루 1회',
      },
    ],
  },
  {
    id: 'board-3',
    childId: 'child-2',
    title: '우럭이우럭의 정리정돈판',
    stickerCount: '20개',
    boardDesign: '바다 여행',
    rewardText: '좋아하는 간식 먹기',
    missions: [
      {
        id: 'mission-3',
        emoji: '🧸',
        title: '장난감 정리',
        days: '월,화,수,목,금',
        frequency: '하루 1회',
      },
    ],
  },
];

const BOARD_1_DEFAULT_MISSIONS: Mission[] =
  initialStickerBoards.find((board) => board.id === 'board-1')?.missions ?? [];

const GrowthContext = createContext<GrowthContextValue | null>(null);

export function GrowthProvider({ children }: { children: ReactNode }) {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>(initialChildren);
  const [boards, setBoards] = useState<StickerBoard[]>(initialStickerBoards);

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
    },
    deleteStickerBoard: (boardId) => {
      setBoards((prev) => prev.filter((board) => board.id !== boardId));
    },
    getChildById: (childId) => childProfiles.find((child) => child.id === childId),
    getBoardById: (boardId) => boards.find((board) => board.id === boardId),
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
