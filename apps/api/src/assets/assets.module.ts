import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Module } from '../s3/s3.module';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService],
  exports: [AssetsService],
  imports: [S3Module],
})
export class AssetsModule {}
