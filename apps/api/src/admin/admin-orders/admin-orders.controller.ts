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
import { AdminOrdersQueryDto } from './dto/admin-orders.query.dto';

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
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get('_ping')
  ping() {
    return { ok: true, ts: Date.now() };
  }

  @Get()
  async list(@Query() dto: AdminOrdersQueryDto) {
    return this.adminOrdersService.getList(dto);
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
