import { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { todagiStyles } from './styles';

type SectionProps = {
  title: string;
  children: ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return (
    <View style={todagiStyles.section}>
      {title ? <Text style={todagiStyles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}
