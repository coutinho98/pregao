import type { LotDetail, PublicBid } from '@pregao/shared';
import { useState } from 'react';
import { Segmented } from '@/components/ui/segmented';
import { useHeldHeight } from '@/lib/use-held-height';
import { LotFacts } from '@/features/lots/components/lot-facts';
import { PaddleHistory } from './paddle-history';

type Tab = 'bids' | 'about';

interface RoomTabsProps {
  lot: LotDetail;
  bids: PublicBid[];
  myPseudonym: string | undefined;
}

/** Under the artwork: the catalogue entry first, then the bid history. */
export function RoomTabs({ lot, bids, myPseudonym }: RoomTabsProps) {
  const [tab, setTab] = useState<Tab>('about');
  const { contentRef, minHeight } = useHeldHeight<HTMLDivElement>(lot.id);
  return (
    <section className="flex flex-col gap-4">
      <Segmented<Tab>
        id="room-tabs"
        label="Detalhes do lote"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'about', label: 'Sobre a obra' },
          {
            value: 'bids',
            label: (
              <>
                Lances <span className="tabular text-ink-3">{bids.length}</span>
              </>
            ),
          },
        ]}
      />
      {/* Switching tabs never shortens the page, so it stays where the visitor scrolled. */}
      <div style={{ minHeight }}>
        <div ref={contentRef}>
          {tab === 'bids' && <PaddleHistory bids={bids} myPseudonym={myPseudonym} />}
          {tab === 'about' && (
            <div>
              <LotFacts lot={lot} />
              <a
                href={lot.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block px-1 text-[13.5px] text-ink-2 underline-offset-4 hover:text-ink hover:underline"
              >
                Ver no Art Institute of Chicago ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
