import type { AuditResult } from '@pregao/shared';
import { WaxSeal } from '@/components/icons/wax-seal';
import { cn } from '@/lib/cn';
import { countLabel } from '@/utils/plural';

interface VerdictView {
  tone: string;
  title: string;
  detail: string;
}

function verdictView(result: AuditResult): VerdictView {
  if (!result.ok) {
    return { tone: 'text-danger', title: 'Adulteração detectada', detail: result.message };
  }
  const verified = countLabel(result.verifiedBids, 'lance verificado', 'lances verificados');
  return {
    tone: 'text-up',
    title: 'Histórico íntegro',
    detail: `${verified} com a chave pública da casa, aqui no seu navegador.`,
  };
}

/** The verdict in one sentence, with a whole or a broken seal. */
export function AuditVerdict({ result, lastHash }: { result: AuditResult; lastHash: string }) {
  const { tone, title, detail } = verdictView(result);
  return (
    <div
      role="status"
      className="flex items-center gap-4 rounded-[22px] bg-card p-4 shadow-card sm:p-5"
    >
      <WaxSeal
        mark={lastHash.slice(0, 6).toUpperCase()}
        broken={!result.ok}
        className={cn('size-16 shrink-0', tone)}
      />
      <div className="min-w-0">
        <p className={cn('text-[17px] font-semibold', tone)}>{title}</p>
        <p className="mt-0.5 text-[14px] leading-snug text-ink-2">{detail}</p>
      </div>
    </div>
  );
}
