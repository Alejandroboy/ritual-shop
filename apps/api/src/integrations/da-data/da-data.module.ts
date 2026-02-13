import { Module } from '@nestjs/common';
import { DaDataService } from './da-data.service';
import { DaDataController } from './da-data.controller';

@Module({
  providers: [DaDataService],
  exports: [DaDataService],
  controllers: [DaDataController],
})
export class DaDataModule {}
