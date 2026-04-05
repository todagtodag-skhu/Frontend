import { View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { childrenStyles as styles } from './styles';

export function NoActiveBoardState() {
  return (
    <View style={styles.emptyBoardCard}>
      <Text style={styles.emptyBoardText}>
        현재 진행중인 스티커판이 없어요.
      </Text>
      <Text style={styles.emptyBoardText}>
        아래 버튼을 눌러 스티커판을 생성하고,
      </Text>
      <Text style={styles.emptyBoardText}>
        미션을 부여할 수 있어요.
      </Text>
    </View>
  );
}
