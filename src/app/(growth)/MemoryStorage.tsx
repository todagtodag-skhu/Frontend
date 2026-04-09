import React from 'react';
import { router } from 'expo-router';

import { CompletedStickerBoardsScreen } from '@/components/memory/CompletedStickerBoardsScreen';
import { useCompletedGrowthStickerBoards } from '@/features/growth/hooks';

export default function MemoryStorageScreen() {
  const { data: boards = [], isLoading, error } = useCompletedGrowthStickerBoards();

  return (
    <CompletedStickerBoardsScreen
      boards={boards}
      isLoading={isLoading}
      error={error}
      onSwipeBack={() => router.push('/MissionHome')}
    />
  );
}
