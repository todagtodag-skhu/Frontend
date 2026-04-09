import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';

import { CompletedStickerBoardsScreen } from '@/components/memory/CompletedStickerBoardsScreen';
import { useTodakRelations } from '@/features/relation/hooks';
import { useTodakMemory } from '@/features/todak/hooks';

export default function TodakMemoryScreen() {
  const { relationId } = useLocalSearchParams<{ relationId?: string }>();
  const { data: relationsData } = useTodakRelations();

  const resolvedRelationId = useMemo(() => {
    if (relationId) return parseInt(relationId, 10);
    return relationsData?.relations?.[0]?.relationId;
  }, [relationId, relationsData]);

  const { data: boards = [], isLoading, error } = useTodakMemory(resolvedRelationId);

  const resolvedError = useMemo(() => {
    if (!error) return null;

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        return new Error('이 관계의 추억 저장소를 조회할 권한이 없어요.');
      }

      if (error.response?.status === 404) {
        return new Error('연결된 관계를 찾을 수 없어요.');
      }
    }

    return new Error('추억 저장소를 불러오지 못했어요. 다시 시도해주세요.');
  }, [error]);

  return (
    <CompletedStickerBoardsScreen
      boards={boards}
      isLoading={isLoading}
      error={resolvedError}
    />
  );
}
