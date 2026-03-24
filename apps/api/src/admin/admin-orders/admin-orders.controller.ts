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
import { AdminOrdersService } from './admin-orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrdersQueryDto } from './dto/admin-orders.query.dto';
import { BulkUpdateOrderStatusDto } from './dto/bulk-update-order-status.dto';

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

  @Patch('status/bulk')
  async bulkSetStatus(@Body() dto: BulkUpdateOrderStatusDto) {
    console.log(1);
    return this.adminOrdersService.bulkUpdateStatus(dto);
  }
}
