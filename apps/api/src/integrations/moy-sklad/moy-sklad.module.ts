import { Module } from '@nestjs/common';
import { MoySkladService } from './moy-sklad.service';
import { MoySkladController } from './moy-sklad.controller';
import { DaDataModule } from '../da-data/da-data.module';

@Module({
  imports: [DaDataModule],
  providers: [MoySkladService],
  exports: [MoySkladService],
  controllers: [MoySkladController],
})
export class MoySkladModule {}
