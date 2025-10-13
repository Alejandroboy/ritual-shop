import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule], // даёт Guard + Jwt + AuthService
  controllers: [AdminStatsController],
  providers: [PrismaService],
})
export class AdminStatsModule {}
