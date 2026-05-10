import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus, Prisma, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { MyOrdersQueryDto } from './dto/my-orders.query.dto';
import { UserOrdersQueryDto } from './dto/user-orders.query.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async findByIdAdmin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        legalName: true,
        address: true,
        kontragentId: true,
        inn: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        telegramChatId: true,
        notifyChannel: true,
        _count: {
          select: {
            customerOrders: true,
            managedOrders: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async getUserOrders(userId: string, dto: UserOrdersQueryDto) {
    const {
      page = 1,
      pageSize = 10,
      status,
      q,
      includedInInvoice,
      invoiceStatus,
      dateFrom,
      dateTo,
    } = dto;

    const and: Prisma.OrderWhereInput[] = [{ customerId: userId }];

    if (status) and.push({ orderStatus: status });

    if (dateFrom || dateTo) {
      and.push({
        createdAt: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {}),
        },
      });
    }

    if (includedInInvoice === 'yes') and.push({ includedInInvoice: true });
    if (includedInInvoice === 'no') and.push({ includedInInvoice: false });

    if (invoiceStatus === 'yes') {
      and.push({ invoice: { status: InvoiceStatus.PAID } });
    }
    if (invoiceStatus === 'no') {
      and.push({
        invoice: {
          status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
        },
      });
    }

    if (q) {
      and.push({
        OR: [
          { number: { contains: q, mode: 'insensitive' } },
          { orderNumber: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.OrderWhereInput = { AND: and };
    const take = Math.max(1, Math.min(100, Number(pageSize)));
    const skip = Math.max(0, (Number(page) - 1) * take);

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        select: {
          id: true,
          orderStatus: true,
          orderNumber: true,
          createdAt: true,
          includedInInvoice: true,
          invoiceId: true,
          invoiceName: true,
          items: {
            include: {
              size: true,
              frame: true,
              background: true,
              assets: true,
              template: {
                include: {
                  allowedSizes: true,
                  finishPrices: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page: Number(page), pageSize: take };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        legalName: true,
        address: true,
        inn: true,
        role: true,
        createdAt: true,
        kontragentId: true,
        updatedAt: true,
        telegramChatId: true,
        notifyChannel: true,
        _count: {
          select: {
            customerOrders: true,
            managedOrders: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getMyOrders(userId: string, dto: MyOrdersQueryDto) {
    const page = Math.max(1, Number(dto.page ?? 1));
    const pageSize = Math.max(1, Math.min(100, Number(dto.pageSize ?? 10)));
    const skip = (page - 1) * pageSize;

    const where: Prisma.OrderWhereInput = {
      customerId: userId,
    };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          orderStatus: true,
          orderNumber: true,
          createdAt: true,
          items: {
            include: { size: true, background: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getMyOrder(id: string) {
    return this.prisma.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        orderStatus: true,
        orderNumber: true,
        createdAt: true,
        items: {
          include: { size: true, background: true },
        },
      },
    });
  }

  async list(params: { q?: string; skip?: number; take?: number }) {
    const { q, skip = 0, take = 20 } = params;
    const where: Prisma.UserWhereInput | undefined = q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: Math.min(take, 100),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
          customerOrders: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async adminCreate(dto: AdminCreateUserDto) {
    const exists = await this.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already registered');
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });
    return await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name ?? null,
        phone: dto.phone ?? null,
        legalName: dto.legalName ?? null,
        address: dto.address ?? null,
        inn: dto.inn ?? null,
        role: dto.role ?? 'CUSTOMER',
        delivery: dto.delivery ?? null,
      },
    });
  }

  async updateSelf(
    userId: string,
    dto: { name?: string | null; phone?: string | null },
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name ?? undefined, phone: dto.phone ?? undefined },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
  }

  async adminUpdate(params: {
    targetUserId: string;
    actorRole: Role;
    dto: {
      email?: string;
      name?: string | null;
      phone?: string | null;
      delivery?: string | null;
      role?: Role;
      password?: string;
    };
  }) {
    const { targetUserId, actorRole, dto } = params;
    const target = await this.findById(targetUserId);

    if (actorRole === 'MANAGER' && dto.role && dto.role === 'ADMIN') {
      throw new BadRequestException('MANAGER cannot promote to ADMIN');
    }
    if (
      actorRole === 'MANAGER' &&
      target.role === 'ADMIN' &&
      (dto.email || dto.password || dto.role)
    ) {
      throw new BadRequestException(
        'MANAGER cannot modify ADMIN critical fields',
      );
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    }

    try {
      return await this.prisma.user.update({
        where: { id: targetUserId },
        data: {
          email: dto.email ?? undefined,
          name: dto.name ?? undefined,
          phone: dto.phone ?? undefined,
          role: dto.role ?? undefined,
          delivery: dto.delivery ?? undefined,
          passwordHash,
        },
        select: { id: true, email: true, name: true, phone: true, role: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }
      throw e;
    }
  }

  async deleteUser(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
      },
    });
    if (user?.role === Role.ADMIN_GOD && role !== Role.ADMIN_GOD) {
      return "Can't delete Super Admin";
    }
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
