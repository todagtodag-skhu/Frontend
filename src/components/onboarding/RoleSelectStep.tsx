import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { onboardingStyles } from './CommonOnboardingScreen';

import TodagiImg from "../../../assets/todagi.svg"
import GrowImg from '../../../assets/grow.svg';

type Role = 'todagi' | 'growth';

type RoleSelectStepProps = {
  selectedRole: Role | null;
  onSelectRole: (role: Role) => void;
  title?: string;
};

const ROLE_OPTIONS: Array<{
  role: Role;
  title: string;
  img: ReactNode;
  description: string;
}> = [
  {
    role: 'todagi',
    title: '토닥이',
    img: <TodagiImg width={100} height={100} />,
    description: '토닥이는 성장이의 스티커판을 관리하고, 미션을 만들어요.',
  },
  {
    role: 'growth',
    img: <GrowImg width={100} height={100} />,
    title: '성장이',
    description: '성장이는 토닥이가 지정한 미션을 수행하며 스티커를 모아요.',
  },
];

export function RoleSelectStep({
  selectedRole,
  onSelectRole,
  title = '역할을 선택해 주세요',
}: RoleSelectStepProps) {
  return (
    <>
      <Text weight="bold" style={onboardingStyles.title}>
        {title}
      </Text>
      <View style={onboardingStyles.roleList}>
        {ROLE_OPTIONS.map((option) => {
          const isSelected = selectedRole === option.role;

          return (
            <Pressable
              key={option.role}
              onPress={() => onSelectRole(option.role)}
              style={[
                onboardingStyles.roleCard,
                isSelected && onboardingStyles.roleCardSelected,
              ]}
            >
              <View style={onboardingStyles.roleCardContent}>
                {option.img}
                <View style={onboardingStyles.roleTextGroup}>
                  <Text style={onboardingStyles.roleTitle}>{option.title}</Text>
                  <Text style={onboardingStyles.roleDescription}>{option.description}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
