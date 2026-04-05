import { View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { todagiStyles as styles } from './styles';

type ChildSummaryCardProps = {
  name: string;
  birthday: string;
};

export function ChildSummaryCard({ name, birthday }: ChildSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.missionItemTitle}>{name}</Text>
      <Text style={styles.missionItemSub}>생일 {birthday}</Text>
    </View>
  );
}
