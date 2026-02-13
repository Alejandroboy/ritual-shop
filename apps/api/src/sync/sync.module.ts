import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { DaDataModule } from '../integrations/da-data/da-data.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MoySkladModule } from '../integrations/moy-sklad/moy-sklad.module';

@Module({
  imports: [DaDataModule, PrismaModule, MoySkladModule],
  controllers: [SyncController],
  exports: [SyncService],
  providers: [SyncService],
})
export class SyncModule {}
