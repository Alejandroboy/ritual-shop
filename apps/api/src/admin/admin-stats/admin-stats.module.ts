import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminStatsService } from './admin-stats.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminStatsController],
  providers: [PrismaService, AdminStatsService],
  exports: [AdminStatsService],
})
export class AdminStatsModule {}
