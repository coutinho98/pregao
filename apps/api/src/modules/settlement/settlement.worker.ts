import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../common/config/env.js';
import { SettlementService } from './settlement.service.js';

/** Looks for ended lots every SETTLEMENT_INTERVAL_MS and settles them. */
@Injectable()
export class SettlementWorker implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(SettlementWorker.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly settlement: SettlementService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  onApplicationBootstrap(): void {
    const intervalMs = this.config.get('SETTLEMENT_INTERVAL_MS', { infer: true });
    if (intervalMs > 0) this.timer = setInterval(() => void this.tick(), intervalMs);
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** A slow run is never overlapped by the next tick. */
  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const closed = await this.settlement.settleDue();
      if (closed > 0) this.logger.log(`Settled ${closed} lot(s)`);
    } catch (error) {
      this.logger.error(error);
    } finally {
      this.running = false;
    }
  }
}
