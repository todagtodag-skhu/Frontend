import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { AppModal } from '@/components/common/AppModal';
import { Button } from '@/components/common/Button';
import { colors } from '@/constants/colors';
import { Text } from '@/components/ui/Text';

type CalendarModalProps = {
  visible: boolean;
  value?: string;
  title: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
  useModal?: boolean;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const matched = value.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);

  if (!matched) {
    return null;
  }

  const [, yearText, monthText, dayText] = matched;
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getMonthLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export function CalendarModal({
  visible,
  value,
  title,
  onConfirm,
  onClose,
  useModal = true,
}: CalendarModalProps) {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(parseDate(value) ?? today);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const parsedDate = parseDate(value) ?? today;
    setSelectedDate(parsedDate);
  }, [value, visible, today]);

  const handleChange = (_event: DateTimePickerEvent, nextDate?: Date) => {
    if (!nextDate) {
      return;
    }

    setSelectedDate(nextDate);
  };

  const handleConfirm = () => {
    if (!selectedDate) {
      return;
    }

    onConfirm(formatDate(selectedDate));
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={title}
      useModal={useModal}
      contentStyle={styles.modalContent}
      footer={
        <View style={styles.buttonRow}>
          <Button title="취소" onPress={onClose} variant="secondary" size="sm" style={styles.button} />
          <Button title="선택" onPress={handleConfirm} variant="soft" size="sm" style={styles.button} />
        </View>
      }
    >
      <Text weight="bold" style={styles.monthLabel}>
        {getMonthLabel(selectedDate ?? today)}
      </Text>

      <View style={styles.pickerWrap}>
        <DateTimePicker
          value={selectedDate ?? today}
          mode="date"
          display="spinner"
          locale="ko-KR"
          maximumDate={today}
          onChange={handleChange}
          style={styles.picker}
        />
      </View>

      <Text style={styles.selectedDateText}>
        선택한 날짜 {selectedDate ? formatDate(selectedDate) : '-'}
      </Text>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    zIndex: 10,
    width: '88%',
    gap: 12,
  },
  monthLabel: {
    fontSize: 18,
    color: colors.grayscale[1000],
    textAlign: 'center',
  },
  pickerWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.grayscale[100],
  },
  picker: {
    height: 180,
    width: '100%',
  },
  selectedDateText: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.grayscale[700],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  button: {
    flex: 1,
    marginTop: 0,
  },
});
