import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { EmailService } from '../../email/email.service';

@Injectable()
export class AdminOrdersService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

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

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const prevOrder = await this.prisma.order.findUnique({
      where: { id },
    });

    const order = this.prisma.order.update({
      where: { id },
      data: { orderStatus: dto.status },
    });
    if (prevOrder?.customerEmail) {
      await this.email.orderStatusChanged(
        prevOrder.customerEmail,
        prevOrder?.number || '',
        prevOrder.orderStatus,
        dto.status,
      );
    }

    return order;
  }
}
