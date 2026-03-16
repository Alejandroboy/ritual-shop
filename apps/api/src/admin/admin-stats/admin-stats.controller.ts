import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/admin.guard';
import { AdminStatsService } from './admin-stats.service';

@UseGuards(AdminGuard)
@Controller('admin/stats')
export class AdminStatsController {
  constructor(private adminStatsService: AdminStatsService) {}

  @Get()
  async get(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('grain') grain: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.adminStatsService.getStats(from, to, grain);
  }
}
