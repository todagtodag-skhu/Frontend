import { StyleSheet } from 'react-native';

import { borderWidth } from '@/constants/borders';
import { colors } from '@/constants/colors';

export const todagiStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary[700],
  },
  scrollView: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 140,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    width: '100%',
    textAlign: 'center',
  },
  section: {
    flexDirection: 'column',
    gap: 14,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: borderWidth.hairline,
    borderColor: '#EEE4D6',
    shadowColor: '#D8C3A2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 2,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.grayscale[100],
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 6,
    borderWidth: borderWidth.hairline,
    borderColor: '#EEE4D6',
  },
  infoCardLabel: {
    fontSize: 13,
    color: '#888888',
  },
  infoCardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 9,
    backgroundColor: colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  emojiPicker: {
    borderWidth: borderWidth.hairline,
    borderColor: '#F0E3C6',
  },
  missionItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  missionItemSub: {
    fontSize: 13,
    color: '#888888',
  },
  selectBox: {
    backgroundColor: colors.grayscale[100],
    borderRadius: 9,
    borderWidth: borderWidth.hairline,
    borderColor: '#E5E5E5',
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  selectPlaceholder: {
    fontSize: 15,
    color: '#AAAAAA',
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    backgroundColor: colors.primary[700],
  },
  footerButton: {
    marginTop: 0,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: colors.grayscale[100],
    borderRadius: 22,
    padding: 24,
    width: '80%',
    gap: 10,
    borderWidth: borderWidth.hairline,
    borderColor: '#F1E7D8',
    shadowColor: '#AA8B58',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: colors.grayscale[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  emojiInput: {
    borderRadius: 16,
    backgroundColor: colors.grayscale[200],
    fontSize: 28,
    color: colors.grayscale[1000],
  },
  modalConfirmButton: {
    flex: 0,
    width: '100%',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: colors.primary[700],
  },
  dayChipText: {
    fontSize: 13,
    color: '#888888',
  },
  dayChipTextSelected: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  missionInput: {
    flex: 1,
    minWidth: 0,
    letterSpacing: -0.3,
    textAlign: 'left',
  },
  missionMeta: {
    flex: 1,
    gap: 4,
  },
  missionDaySelect: {
    flex: 1,
  },
  missionFrequencySelect: {
    width: 90,
  },
  addMissionButton: {
    marginTop: 0,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.grayscale[700],
  },
  missionTip: {
    fontSize: 13,
    lineHeight: 20,
    color: '#C47F17',
  },
  editingCaption: {
    fontSize: 14,
    color: colors.grayscale[700],
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  missionManageTip: {
    fontSize: 14,
    lineHeight: 22,
    color: '#FF7A00',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFF4E2',
    borderWidth: borderWidth.hairline,
    borderColor: '#F4DFC1',
  },
  missionManageIntro: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.grayscale[700],
  },
});
