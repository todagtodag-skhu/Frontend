import { ChildProfile, Mission, StickerBoard, StickerRequest } from '@/components/todagi/types';

export type TreeMission = {
  id: string;
  emoji: string;
  title: string;
  completed: boolean;
};

export type CompletedStickerBoard = {
  id: string;
  title: string;
  reward: string;
  boardDesign: string;
  stickers: {
    emoji: string;
    title: string;
  }[];
};

// 성장이 정보
export const MOCK_CHILDREN: ChildProfile[] = [
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

// 미션 목록
export const MOCK_STICKER_BOARDS: StickerBoard[] = [
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
        emoji: '🍚',
        title: '밥먹기',
        days: '월,화,수,목,금',
        frequency: '하루 2회',
      },
      {
        id: 'mission-1-2',
        emoji: '🧹',
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

export const MOCK_COMPLETED_STICKER_BOARDS: CompletedStickerBoard[] = [
  {
    id: 'board-1',
    title: '유진이의 성장나무',
    reward: '닌텐도 스위치',
    boardDesign: '우주 탐험',
    stickers: [
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '🦷', title: '양치하기' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '🦷', title: '양치하기' },
      { emoji: '🦷', title: '양치하기' },
      { emoji: '🦷', title: '양치하기' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '☺', title: '밥먹기' },
      { emoji: '🦷', title: '양치하기' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
      { emoji: '❤', title: '칭찬 스티커' },
    ],
  },
  {
    id: 'board-2',
    title: '유진이의 책 읽기판',
    reward: '새 그림책',
    boardDesign: '성장 나무',
    stickers: [
      { emoji: '📚', title: '책 읽기' },
      { emoji: '⭐', title: '독서 칭찬' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '⭐', title: '독서 칭찬' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '⭐', title: '독서 칭찬' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '⭐', title: '독서 칭찬' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '⭐', title: '독서 칭찬' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '⭐', title: '독서 칭찬' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '⭐', title: '독서 칭찬' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '📚', title: '책 읽기' },
      { emoji: '⭐', title: '독서 칭찬' },
    ],
  },
  {
    id: 'board-3',
    title: '유진이의 정리판',
    reward: '키즈카페 가기',
    boardDesign: '바다 여행',
    stickers: [
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '✨', title: '정리 칭찬' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '✨', title: '정리 칭찬' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '✨', title: '정리 칭찬' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '✨', title: '정리 칭찬' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '✨', title: '정리 칭찬' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '✨', title: '정리 칭찬' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '✨', title: '정리 칭찬' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '🧸', title: '장난감 정리' },
      { emoji: '✨', title: '정리 칭찬' },
    ],
  },
];

export const MOCK_DEFAULT_TREE_MISSIONS: TreeMission[] = [
  { id: 'm1', emoji: '🧹', title: '방 청소하기', completed: false },
  { id: 'm2', emoji: '✏️', title: '숙제 스스로 하기', completed: false },
  { id: 'm3', emoji: '⏰', title: '일찍 일어나기', completed: false },
  { id: 'm4', emoji: '🥦', title: '채소 다 먹기', completed: false },
  { id: 'm5', emoji: '🤝', title: '동생이랑 사이좋게 지내기', completed: false },
  { id: 'm6', emoji: '📚', title: '책 읽기', completed: false },
  { id: 'm7', emoji: '🧼', title: '손 씻기', completed: false },
  { id: 'm8', emoji: '🎹', title: '피아노 연습하기', completed: false },
  { id: 'm9', emoji: '💤', title: '낮잠 안 자기', completed: false },
];

// 현재 스티커판 미션 요청
export const MOCK_STICKER_REQUESTS: StickerRequest[] = [
  {
    id: 'req-1',
    missionId: 'mission-1',
    missionEmoji: '🪥',
    missionTitle: '양치하기',
    stickerCount: 1,
    requestedAt: '오늘 오전 8:12',
  },
  {
    id: 'req-2',
    missionId: 'mission-1-1',
    missionEmoji: '🍚',
    missionTitle: '밥먹기',
    stickerCount: 1,
    requestedAt: '오늘 오후 12:34',
  },
  {
    id: 'req-3',
    missionId: 'mission-1-2',
    missionEmoji: '🧹',
    missionTitle: '청소하기',
    stickerCount: 2,
    requestedAt: '오늘 오후 3:07',
  },
];

export function cloneMission(mission: Mission): Mission {
  return { ...mission };
}

export function cloneStickerBoard(board: StickerBoard): StickerBoard {
  return {
    ...board,
    missions: board.missions.map(cloneMission),
  };
}

// 이전 스티커판에서 이월된 미션 요청
export const MOCK_PREVIOUS_STICKER_REQUESTS: StickerRequest[] = [
  {
    id: 'prev-req-1',
    missionId: 'old-mission-1',
    missionEmoji: '📚',
    missionTitle: '독서하기',
    stickerCount: 1,
    requestedAt: '어제 오후 7:30',
  },
  {
    id: 'prev-req-2',
    missionId: 'old-mission-2',
    missionEmoji: '🏃',
    missionTitle: '운동하기',
    stickerCount: 1,
    requestedAt: '어제 오후 5:15',
  },
];
