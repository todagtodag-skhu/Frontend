import React from 'react';
import { router } from 'expo-router';

import { CompletedStickerBoardsScreen } from '@/components/memory/CompletedStickerBoardsScreen';
import { useCompletedGrowthStickerBoards } from '@/features/growth/hooks';

const MemoryStorageScreen: React.FC = () => {
  const { data: boards = [], isLoading, error } = useCompletedGrowthStickerBoards();
  return <CompletedStickerBoardsScreen boards={boards} isLoading={isLoading} error={error} onSwipeBack={() => router.push('/MissionHome')} />;
};

export default MemoryStorageScreen;
