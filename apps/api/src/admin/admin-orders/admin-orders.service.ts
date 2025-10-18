import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminOrdersService {
  constructor(private prisma: PrismaService) {}

  async getList(page: string, status?: string, q?: string) {
    const where: any = {};
    if (status) where.status = status;
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
    return { items, total, page: +page };
  }

  async getById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { assets: true } },
        customer: true,
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { orderStatus: status },
    });
  }
}
