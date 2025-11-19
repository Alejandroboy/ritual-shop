import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { EmailService } from '../../email/email.service';
import { TelegramService } from '../../notifications/telegram/telegram.service';
import { Prisma } from '@prisma/client';
import { AdminOrdersQueryDto } from './dto/admin-orders.query.dto';

function endOfDayIso(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
@Injectable()
export class AdminOrdersService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private telegram: TelegramService,
  ) {}

  async getList(dto: AdminOrdersQueryDto) {
    const {
      page = 1,
      pageSize = 25,
      status,
      q,
      userId,
      userEmail,
      dateFrom,
      dateTo,
    } = dto;

    const and: Prisma.OrderWhereInput[] = [];

    if (status) and.push({ orderStatus: status as any });

    if (userId) {
      and.push({
        OR: [{ customerId: userId }, { customer: { id: userId } }],
      });
    }

    if (userEmail) {
      and.push({
        OR: [
          { customerEmail: { contains: userEmail, mode: 'insensitive' } },
          { customer: { email: { contains: userEmail, mode: 'insensitive' } } },
        ],
      });
    }

    if (dateFrom || dateTo) {
      and.push({
        createdAt: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: endOfDayIso(new Date(dateTo)) } : {}),
        },
      });
    }

    if (q) {
      and.push({
        OR: [
          { number: { contains: q, mode: 'insensitive' } },
          { customerEmail: { contains: q, mode: 'insensitive' } },
          { customer: { email: { contains: q, mode: 'insensitive' } } },
          { customer: { name: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    const where: Prisma.OrderWhereInput = and.length ? { AND: and } : {};

    const take = Math.max(1, Math.min(100, Number(pageSize)));
    const skip = Math.max(0, (Number(page) - 1) * take);

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          items: { include: { assets: true } },
          customer: { select: { id: true, email: true, name: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page: Number(page), pageSize: take };
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
      select: {
        number: true,
        orderStatus: true,
        customerEmail: true,
      },
    });

    if (prevOrder?.orderStatus === dto.status) return;

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { notifyChannel: true, telegramChatId: true },
    });

    const order = await this.prisma.order.update({
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

    if (user?.telegramChatId) {
      await this.telegram.orderStatusChanged(
        user.telegramChatId,
        prevOrder?.number || '',
        prevOrder?.orderStatus || '',
        dto.status,
      );
    }

    return order;
  }
}
