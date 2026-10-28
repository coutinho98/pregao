export type OfficeTab = 'lotes' | 'novo';

export const TAB_PARAM = 'aba';
export const DEFAULT_TAB: OfficeTab = 'lotes';

export const officeTabs: { value: OfficeTab; label: string }[] = [
  { value: 'lotes', label: 'Seus lotes' },
  { value: 'novo', label: 'Novo lote' },
];

/** Tab for the ?aba= value; anything unknown opens the auctioneer's lots. */
export function officeTabFromParam(value: string | null): OfficeTab {
  return officeTabs.find((tab) => tab.value === value)?.value ?? DEFAULT_TAB;
}
