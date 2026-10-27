import type { LotDetail, PublicBid } from '@pregao/shared';
import { useState } from 'react';
import { Segmented } from '@/components/ui/segmented';
import { LotFacts } from '@/features/lots/components/lot-facts';
import { PaddleHistory } from './paddle-history';

type Tab = 'bids' | 'about';

interface RoomTabsProps {
  lot: LotDetail;
  bids: PublicBid[];
  myPseudonym: string | undefined;
}

/** Under the artwork: the bid history or the catalogue entry. */
export function RoomTabs({ lot, bids, myPseudonym }: RoomTabsProps) {
  const [tab, setTab] = useState<Tab>('bids');
  return (
    <section className="flex flex-col gap-4">
      <Segmented<Tab>
        id="room-tabs"
        label="Detalhes do lote"
        value={tab}
        onChange={setTab}
        options={[
          {
            value: 'bids',
            label: (
              <>
                Lances <span className="tabular text-ink-3">{bids.length}</span>
              </>
            ),
          },
          { value: 'about', label: 'Sobre a obra' },
        ]}
      />
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
    </section>
  );
}
