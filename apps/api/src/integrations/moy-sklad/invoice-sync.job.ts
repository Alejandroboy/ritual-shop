import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MoySkladService } from './moy-sklad.service';

@Injectable()
export class InvoiceSyncJob {
  private readonly logger = new Logger(InvoiceSyncJob.name);

  constructor(private readonly moySkladService: MoySkladService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handle() {
    try {
      const result = await this.moySkladService.syncPendingInvoices(50);

      this.logger.log(`Invoice sync done: checked=${result.total}`);
    } catch (error) {
      this.logger.error(
        'Invoice sync failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
