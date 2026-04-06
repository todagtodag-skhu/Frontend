import { ReactNode } from 'react';
import {
  Modal,
  ModalProps,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { todagiStyles } from '@/components/todagi/styles';
import { colors } from '@/constants/colors';

type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  useModal?: boolean;
  closeOnBackdropPress?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  animationType?: ModalProps['animationType'];
};

export function AppModal({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  useModal = true,
  closeOnBackdropPress = true,
  contentStyle,
  bodyStyle,
  animationType = 'fade',
}: AppModalProps) {
  if (!visible) {
    return null;
  }

  const content = (
    <View style={todagiStyles.modalOverlay}>
      <Pressable
        style={todagiStyles.modalBackdrop}
        onPress={closeOnBackdropPress ? onClose : undefined}
      />
      <View style={[todagiStyles.modalContent, styles.content, contentStyle]}>
        {(title || description) ? (
          <View style={styles.header}>
            {title ? (
              <Text weight="bold" style={styles.title}>
                {title}
              </Text>
            ) : null}
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
        ) : null}

        {children ? <View style={[styles.body, bodyStyle]}>{children}</View> : null}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </View>
  );

  if (!useModal) {
    return content;
  }

  return (
    <Modal visible transparent animationType={animationType} onRequestClose={onClose}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '80%',
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.grayscale[1000],
    lineHeight: 26,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.grayscale[700],
  },
  body: {
    gap: 12,
  },
  footer: {
    marginTop: 4,
  },
});
