import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { CalendarModal } from '@/components/todagi/CalendarModal';
import { Section } from '@/components/todagi/Section';
import { todagiStyles } from '@/components/todagi/styles';
import { Text } from '@/components/ui/Text';
import { useGrowth } from '@/contexts/GrowthContext';

export default function ChildDetailScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId?: string }>();
  const { getBoardsByChildId, getChildById, deleteStickerBoard, updateChild, deleteChild } =
    useGrowth();

  const child = getChildById(childId);
  const stickerBoards = getBoardsByChildId(childId);
  const resolvedChildName = child?.name ?? '성장이';
  const [isEditing, setIsEditing] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);

  useEffect(() => {
    if (!child) {
      return;
    }

    setInviteCode(child.inviteCode);
    setName(child.name);
    setBirthday(child.birthday);
  }, [child]);

  const handleSave = () => {
    if (!childId || !child) {
      return;
    }

    if (!inviteCode.trim() || !name.trim() || !birthday.trim()) {
      Alert.alert('알림', '초대코드, 이름, 생일을 모두 입력해주세요.');
      return;
    }

    updateChild(childId, {
      inviteCode: inviteCode.trim(),
      name: name.trim(),
      birthday: birthday.trim(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (child) {
      setInviteCode(child.inviteCode);
      setName(child.name);
      setBirthday(child.birthday);
    }

    setIsEditing(false);
  };

  const handleDeleteChild = () => {
    if (!childId || !child) {
      return;
    }

    Alert.alert('성장이 삭제', `"${child.name}" 정보를 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteChild(childId);
          router.replace('/children');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={todagiStyles.safeArea}>
      <ScrollView
        contentContainerStyle={[todagiStyles.scrollView, styles.scrollView]}
        showsVerticalScrollIndicator={false}
      >
        <Text weight="bold" style={todagiStyles.title}>
          {resolvedChildName} 스티커판
        </Text>

        <Section title="성장이 정보">
          <View style={styles.list}>
            <View style={todagiStyles.card}>
              {isEditing ? (
                <View style={styles.editForm}>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>초대코드</Text>
                    <TextInput
                      value={inviteCode}
                      onChangeText={setInviteCode}
                      placeholder="초대코드 입력"
                      style={styles.fieldInput}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>이름</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="성장이 이름"
                      style={styles.fieldInput}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>생일</Text>
                    <Pressable
                      style={[styles.dateField, !birthday && styles.dateFieldEmpty]}
                      onPress={() => setBirthdayModalVisible(true)}
                    >
                      <Text style={[styles.dateFieldText, !birthday && styles.dateFieldPlaceholder]}>
                        {birthday || '생년월일을 선택해주세요'}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.actionRow}>
                    <Pressable style={styles.actionChip} onPress={handleCancelEdit}>
                      <Text style={styles.actionChipText}>취소</Text>
                    </Pressable>
                    <Pressable style={styles.actionChip} onPress={handleSave}>
                      <Text style={styles.actionChipText}>저장</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <Text weight="bold" style={styles.itemTitle}>
                    {resolvedChildName}
                  </Text>
                  <Text style={styles.itemSub}>초대코드 {child?.inviteCode ?? '-'}</Text>
                  <Text style={styles.itemSub}>생일 {child?.birthday ?? '-'}</Text>
                  <Text style={styles.itemSub}>연결된 스티커판 {stickerBoards.length}개</Text>
                  <View style={styles.actionRow}>
                    <Pressable style={styles.actionChip} onPress={() => setIsEditing(true)}>
                      <Text style={styles.actionChipText}>수정</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionChip, styles.deleteChip]}
                      onPress={handleDeleteChild}
                    >
                      <Text style={[styles.actionChipText, styles.deleteChipText]}>삭제</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </Section>

        <Section title="연결된 스티커판">
          <View style={styles.list}>
            {stickerBoards.length > 0 ? (
              stickerBoards.map((board) => (
                <Pressable key={board.id} style={todagiStyles.card}>
                  <Text weight="bold" style={styles.itemTitle}>
                    {board.title}
                  </Text>
                  <Text style={styles.itemSub}>
                    {board.boardDesign} · {board.stickerCount}
                  </Text>
                  <Text style={styles.itemSub}>미션 {board.missions.length}개</Text>
                  <View style={styles.actionRow}>
                    <Pressable
                      style={styles.actionChip}
                      onPress={() =>
                        router.push({
                          pathname: '/create-sticker',
                          params: { childId, boardId: board.id },
                        })
                      }
                    >
                      <Text style={styles.actionChipText}>수정</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionChip, styles.deleteChip]}
                      onPress={() =>
                        Alert.alert('스티커판 삭제', `"${board.title}"을 삭제할까요?`, [
                          { text: '취소', style: 'cancel' },
                          {
                            text: '삭제',
                            style: 'destructive',
                            onPress: () => deleteStickerBoard(board.id),
                          },
                        ])
                      }
                    >
                      <Text style={[styles.actionChipText, styles.deleteChipText]}>삭제</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={todagiStyles.card}>
                <Text style={styles.emptyText}>아직 생성된 스티커판이 없습니다.</Text>
              </View>
            )}
          </View>
        </Section>

        <Button
          title="새 스티커판 만들기"
          onPress={() =>
            router.push({
              pathname: '/create-sticker',
              params: { childId },
            })
          }
          style={styles.createButton}
        />
      </ScrollView>

      <CalendarModal
        visible={birthdayModalVisible}
        value={birthday}
        title="생일 선택"
        onConfirm={setBirthday}
        onClose={() => setBirthdayModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingBottom: 36,
  },
  list: {
    gap: 10,
  },
  itemTitle: {
    fontSize: 20,
  },
  itemSub: {
    fontSize: 13,
    color: '#888888',
  },
  editForm: {
    gap: 12,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
  },
  fieldInput: {
    fontSize: 18,
    paddingVertical: 14,
  },
  dateField: {
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dateFieldEmpty: {
    backgroundColor: '#FFFFFF',
  },
  dateFieldText: {
    fontSize: 18,
    color: '#222222',
  },
  dateFieldPlaceholder: {
    color: '#999999',
  },
  emptyText: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
  },
  createButton: {
    width: '100%',
    marginTop: 0,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  actionChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFF2D9',
  },
  actionChipText: {
    fontSize: 13,
    color: '#8B5E1A',
  },
  deleteChip: {
    backgroundColor: '#FDE8E8',
  },
  deleteChipText: {
    color: '#B54747',
  },
});
