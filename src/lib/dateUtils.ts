/** "YYYY.MM.DD" → "YYYY-MM-DD" (API 형식) */
export function toISODate(displayDate: string): string {
  return displayDate.replace(/\./g, '-');
}

/** "YYYY-MM-DD" → "YYYY.MM.DD" (표시 형식) */
export function toDisplayDate(isoDate: string): string {
  return isoDate.replace(/-/g, '.');
}
