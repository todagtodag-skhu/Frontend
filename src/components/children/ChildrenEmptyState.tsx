import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { childrenStyles as styles } from './styles';

type ChildrenEmptyStateProps = {
  onPressAddChild: () => void;
};

export function ChildrenEmptyState({ onPressAddChild }: ChildrenEmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>먼저 성장이를 연결해주세요.</Text>
      <Pressable style={styles.primaryButton} onPress={onPressAddChild}>
        <Text weight="bold" style={styles.primaryButtonText}>
          성장이 추가하기
        </Text>
      </Pressable>
    </View>
  );
}
