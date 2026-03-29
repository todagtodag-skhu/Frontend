import { Pressable } from 'react-native';

import { Text } from '@/components/ui/Text';

import { todagiStyles } from './styles';

type InfoSelectCardProps = {
  label: string;
  value: string;
  onPress: () => void;
};

export function InfoSelectCard({ label, value, onPress }: InfoSelectCardProps) {
  return (
    <Pressable style={todagiStyles.infoCard} onPress={onPress}>
      <Text style={todagiStyles.infoCardLabel}>{label}</Text>
      <Text style={todagiStyles.infoCardValue}>{value}</Text>
    </Pressable>
  );
}
