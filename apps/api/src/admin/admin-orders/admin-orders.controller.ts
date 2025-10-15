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
import { OrderStatus } from '@prisma/client';

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
  constructor(private prisma: PrismaService) {}
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
    // фильтры + пагинация (пример)
    const where: any = {};
    if (status) where.status = status;
    // q можно применить к humanNumber/клиенту и т.д.
    const take = 25,
      skip = (parseInt(page) - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: { items: { include: { assets: true } } },
      }),
      this.prisma.order.count({ where }),
    ]);
    console.log('items', items);
    return { items, total, page: +page };
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { assets: true } },
        customer: true,
      },
    });
  }

  @Patch(':id/status')
  async setStatus(
    @Param('id') id: string,
    @Body() dto: { orderStatus: OrderStatus },
  ) {
    return this.prisma.order.update({
      where: { id },
      data: { orderStatus: dto.orderStatus },
    });
  }
}
