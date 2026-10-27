import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { paths } from '@/app/paths';
import { ErrorState } from '@/components/feedback/error-state';
import { Page } from '@/components/layout/page';
import { BlurIn } from '@/components/motion/blur-in';
import { formatLotNumber } from '@/features/lots/format';
import { errorMessage } from '@/lib/errors';
import { chainLinks } from '../chain-links';
import { AuditVerdict } from '../components/audit-verdict';
import { HowWeVerify } from '../components/how-we-verify';
import { SealChain } from '../components/seal-chain';
import { useAudit } from '../hooks/use-audit';

/** Public, no login: anyone can check that the lot's history was not tampered with. */
export function AuditPage() {
  const { lotId = '' } = useParams();
  const audit = useAudit(lotId);

  return (
    <Page>
      <Link
        to={paths.lot(lotId)}
        className="mb-4 -ml-1 inline-flex items-center gap-0.5 text-[13.5px] text-ink-3 transition-colors hover:text-ink"
      >
        <ChevronLeft size={16} /> Voltar ao lote
      </Link>
      {audit.isPending && <p className="mt-6 text-ink-3">Verificando a cadeia de lances…</p>}
      {audit.isError && (
        <ErrorState message={errorMessage(audit.error)} onRetry={() => void audit.refetch()} />
      )}
      {audit.data && (
        <div className="flex flex-col gap-6">
          <header>
            <p className="text-[13px] text-ink-3">
              Auditoria · {formatLotNumber(audit.data.trail.lotNumber)}
            </p>
            <h1 className="artwork-title text-[30px] leading-tight">{audit.data.trail.title}</h1>
          </header>
          <BlurIn delay={0.1}>
            <AuditVerdict result={audit.data.result} lastHash={audit.data.trail.head.lastHash} />
          </BlurIn>
          <SealChain links={chainLinks(audit.data.trail, audit.data.result)} />
          <HowWeVerify publicKey={audit.data.trail.publicKey} />
        </div>
      )}
    </Page>
  );
}
