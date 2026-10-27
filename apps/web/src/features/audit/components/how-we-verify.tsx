import { ChevronDown } from 'lucide-react';

/** The technique in four sentences, folded by default. */
export function HowWeVerify({ publicKey }: { publicKey: string }) {
  return (
    <details className="group rounded-[18px] bg-surface px-4 py-3 text-[14px] text-ink-2">
      <summary className="flex cursor-pointer list-none items-center justify-between font-[560] text-ink">
        Como verificamos
        <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 flex flex-col gap-2 leading-relaxed">
        <p>
          Cada lance guarda o hash SHA-256 do lance anterior, então mudar, apagar ou inserir um
          lance quebra todos os elos seguintes.
        </p>
        <p>
          Cada elo é assinado com a chave privada da casa (Ed25519), que fica fora do banco: quem
          mexer no banco não consegue refazer as assinaturas.
        </p>
        <p>
          Uma assinatura de fechamento cobre o número de lances e o último hash, e denuncia lances
          apagados do fim.
        </p>
        <p>
          Esta página baixa os dados como estão gravados e refaz todas as contas no seu navegador,
          com a chave pública abaixo.
        </p>
        <p className="tabular mt-1 break-all text-[11.5px] text-ink-3">
          Chave pública: {publicKey}
        </p>
      </div>
    </details>
  );
}
