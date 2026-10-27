import type { AuditResult } from '@pregao/shared';
import { WaxSeal } from '@/components/icons/wax-seal';
import { cn } from '@/lib/cn';

/** The verdict in one sentence, with a whole or a broken seal. */
export function AuditVerdict({ result, lastHash }: { result: AuditResult; lastHash: string }) {
  const mark = lastHash.slice(0, 6).toUpperCase();
  return (
    <div
      role="status"
      className="flex items-center gap-4 rounded-[22px] bg-card p-4 shadow-card sm:p-5"
    >
      <WaxSeal
        mark={mark}
        broken={!result.ok}
        className={cn('size-16 shrink-0', result.ok ? 'text-up' : 'text-danger')}
      />
      <div className="min-w-0">
        <p className={cn('text-[17px] font-semibold', result.ok ? 'text-up' : 'text-danger')}>
          {result.ok ? 'Histórico íntegro' : 'Adulteração detectada'}
        </p>
        <p className="mt-0.5 text-[14px] leading-snug text-ink-2">
          {result.ok
            ? `${result.verifiedBids} ${result.verifiedBids === 1 ? 'lance verificado' : 'lances verificados'} com a chave pública da casa, aqui no seu navegador.`
            : result.message}
        </p>
      </div>
    </div>
  );
}
