import { Module } from '@nestjs/common';
import { MoySkladService } from './moy-sklad.service';
import { MoySkladController } from './moy-sklad.controller';
import { DaDataModule } from '../da-data/da-data.module';
import { ScheduleModule } from '@nestjs/schedule';
import { InvoiceSyncJob } from './invoice-sync.job';

@Module({
  imports: [ScheduleModule.forRoot(), DaDataModule],
  providers: [MoySkladService, InvoiceSyncJob],
  exports: [MoySkladService],
  controllers: [MoySkladController],
})
export class MoySkladModule {}
