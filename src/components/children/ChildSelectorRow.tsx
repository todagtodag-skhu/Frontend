import { Pressable, ScrollView, View } from 'react-native';

import { ChildProfile } from '@/components/todagi/types';
import { Text } from '@/components/ui/Text';

import { childrenStyles as styles } from './styles';

type ChildSelectorRowProps = {
  children: ChildProfile[];
  selectedChildId?: string;
  onSelectChild: (childId: string) => void;
  onPressAddChild: () => void;
  onPressEditChild?: () => void;
};

export function ChildSelectorRow({
  children,
  selectedChildId,
  onSelectChild,
  onPressAddChild,
  onPressEditChild,
}: ChildSelectorRowProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>연결된 성장이 목록</Text>
        {onPressEditChild ? (
          <Pressable onPress={onPressEditChild}>
            <Text style={styles.editLink}>정보 수정</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorScrollContent}
      >
        {children.map((child) => {
          const isSelected = child.id === selectedChildId;

          return (
            <Pressable
              key={child.id}
              style={[styles.childChip, isSelected && styles.childChipSelected]}
              onPress={() => onSelectChild(child.id)}
            >
              <Text style={styles.childChipText}>{child.name}</Text>
            </Pressable>
          );
        })}

        <Pressable style={styles.addChildChip} onPress={onPressAddChild}>
          <Text style={styles.addChildChipText}>+성장이 추가</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
