import { Injectable } from '@nestjs/common';
import { type GenesisFields, genesisMessage, headMessage } from '@pregao/shared';
import { AuditSigner } from '../../common/crypto/audit-signer.js';
import { sha256Hex } from '../../common/crypto/sha256.js';

export interface LotSeal {
  genesisHash: string;
  headSignature: string;
}

/** Builds the tamper-evident chain of a lot (see packages/shared/src/audit-chain.ts). */
@Injectable()
export class AuditChainService {
  constructor(private readonly signer: AuditSigner) {}

  /** Genesis of a lot without bids: the head points at the genesis hash. */
  async sealGenesis(fields: GenesisFields): Promise<LotSeal> {
    const genesisHash = sha256Hex(genesisMessage(fields));
    const headSignature = await this.signer.sign(
      headMessage({ lotId: fields.lotId, bidCount: 0, lastHash: genesisHash }),
    );
    return { genesisHash, headSignature };
  }
}
