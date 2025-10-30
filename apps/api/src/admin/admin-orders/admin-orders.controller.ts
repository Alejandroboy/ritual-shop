import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../common/admin.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminOrdersService } from './admin-orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('admin/orders')
export class AdminOrdersPingController {
  @Get('_ping')
  ping() {
    return { ok: true, ts: Date.now() };
  }
}

@UseGuards(AdminGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(
    private prisma: PrismaService,
    private readonly adminOrdersService: AdminOrdersService,
  ) {}
  @Get('_ping')
  ping() {
    return { ok: true, ts: Date.now() };
  }

  @Get()
  async list(
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('page') page = '1',
  ) {
    return await this.adminOrdersService.getList(page, status, q);
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    return this.adminOrdersService.getById(id);
  }

  @Patch(':id/status')
  async setStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.adminOrdersService.updateStatus(id, dto);
  }
}
