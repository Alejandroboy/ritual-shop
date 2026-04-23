import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';
import { TelegramService } from '../../notifications/telegram/telegram.service';
import { Prisma, InvoiceStatus, OrderStatus } from '@prisma/client';
import { AdminOrdersQueryDto } from './dto/admin-orders.query.dto';
import { RemindersService } from '../../reminders/reminders.service';

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
    private remindersService: RemindersService,
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
      userNameContains,
      includedInInvoice,
      invoiceStatus,
    } = dto;

    const and: Prisma.OrderWhereInput[] = [];

    if (status) {
      and.push({ orderStatus: status });
    }

    if (userId) {
      and.push({ customerId: userId });
    }

    if (userNameContains) {
      and.push({
        OR: [
          { customerName: { contains: userNameContains, mode: 'insensitive' } },
          {
            customer: {
              name: { contains: userNameContains, mode: 'insensitive' },
            },
          },
        ],
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

    if (includedInInvoice === 'yes') {
      and.push({ includedInInvoice: true });
    }

    if (includedInInvoice === 'no') {
      and.push({ includedInInvoice: false });
    }

    if (invoiceStatus === 'yes') {
      and.push({
        invoice: {
          status: InvoiceStatus.PAID,
        },
      });
    }

    if (invoiceStatus === 'no') {
      and.push({
        invoice: {
          status: {
            in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL],
          },
        },
      });
    }

    if (q) {
      and.push({
        OR: [
          { number: { contains: q, mode: 'insensitive' } },
          { orderNumber: { contains: q, mode: 'insensitive' } },
          { customerName: { contains: q, mode: 'insensitive' } },
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
          invoice: true,
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
        items: {
          include: {
            background: true,
            discussComments: {
              select: { id: true, text: true, date: true, userName: true },
              orderBy: { date: 'desc' },
            },
            assets: true,
            template: {
              include: {
                allowedSizes: {
                  include: {
                    size: true, // чтобы сразу получить width/height/label
                  },
                },
                allowedHoles: true,
                allowedFrames: {
                  include: {
                    frame: true,
                  },
                },
                allowedBackgrounds: {
                  include: {
                    background: true,
                  },
                },
                allowedFinishes: true,
              },
            },
          },
        },
        customer: true,
      },
    });
  }

  async bulkUpdateStatus(dto: { ids: string[]; status: OrderStatus }) {
    const results: Array<{
      id: string;
      ok: boolean;
      error?: string;
    }> = [];

    for (const id of dto.ids) {
      try {
        await this.updateStatus(id, { status: dto.status });
        results.push({ id, ok: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        results.push({ id, ok: false, error: message });
      }
    }

    return {
      total: dto.ids.length,
      successCount: results.filter((x) => x.ok).length,
      failCount: results.filter((x) => !x.ok).length,
      results,
    };
  }

  async updateStatus(id: string, dto: { status: OrderStatus }) {
    const prevOrder = await this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        number: true,
        orderStatus: true,
        customerEmail: true,
        customerId: true,
      },
    });

    if (!prevOrder) {
      throw new NotFoundException('Order not found');
    }

    if (prevOrder.orderStatus === dto.status) {
      return prevOrder;
    }

    const prevStatus = prevOrder.orderStatus;

    const user = prevOrder.customerId
      ? await this.prisma.user.findUnique({
          where: { id: prevOrder.customerId },
          select: { notifyChannel: true, telegramChatId: true },
        })
      : null;

    const order = await this.prisma.order.update({
      where: { id },
      data: { orderStatus: dto.status },
    });

    if (prevOrder.customerEmail) {
      await this.email.orderStatusChanged(
        prevOrder.customerEmail,
        prevOrder.number || '',
        prevOrder.orderStatus,
        dto.status,
      );
    }

    if (
      dto.status === OrderStatus.APPROVAL &&
      prevStatus !== OrderStatus.APPROVAL
    ) {
      await this.remindersService.startApprovalReminder({
        orderId: id,
        userId: prevOrder.customerId ?? undefined,
        orderNumber: prevOrder.number || '',
      });
    }

    if (
      prevStatus === OrderStatus.APPROVAL &&
      dto.status !== OrderStatus.APPROVAL
    ) {
      await this.remindersService.stopApprovalReminder(id);
    }

    if (user?.telegramChatId) {
      await this.telegram.orderStatusChanged(
        user.telegramChatId,
        prevOrder.number || '',
        prevOrder.orderStatus,
        dto.status,
      );
    }

    return order;
  }
}
