import { ChildProfile, StickerBoard, StickerRequest } from '@/components/todagi/types';


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
    boardDesign: '호랑이',
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
    boardDesign: '호랑이',
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
