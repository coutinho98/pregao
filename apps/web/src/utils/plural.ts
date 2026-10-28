/** The singular or plural form of a word for `count` (Portuguese: only 1 is singular). */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/** "1 lote", "3 lotes". */
export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}
