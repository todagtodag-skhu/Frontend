import { ChildProfile, StickerBoard } from '@/components/todagi/types';

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
