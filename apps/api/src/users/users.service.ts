import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';
import * as argon2 from 'argon2';

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
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            customerOrders: true,
            managedOrders: true,
          },
        },
        customerOrders: {
          select: {
            id: true,
            orderStatus: true,
            createdAt: true,
            totalMinor: true,
            items: {
              include: { assets: true },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) {
      // чтобы не падать 500 при null
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // связи по необходимости:
        _count: {
          select: {
            customerOrders: true,
            managedOrders: true,
          },
        },
        customerOrders: {
          select: {
            id: true,
            orderStatus: true,
            createdAt: true,
            totalMinor: true,
            items: {
              include: { assets: true },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    console.log('findById user', user);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
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

  async adminCreate(dto: {
    email: string;
    password: string;
    name?: string | null;
    phone?: string | null;
    role?: Role;
  }) {
    const exists = await this.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already registered');
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name ?? null,
        phone: dto.phone ?? null,
        role: dto.role ?? 'CUSTOMER',
      },
    });
    return user;
  }

  async updateSelf(
    userId: string,
    dto: { name?: string | null; phone?: string | null },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name ?? undefined, phone: dto.phone ?? undefined },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
    return user;
  }

  /**
   * Админ/менеджер обновляют пользователя.
   * - Менеджер НЕ может менять роль на ADMIN и не может менять email/пароль админам.
   * - Админ может менять роль/email/пароль всем.
   */
  async adminUpdate(params: {
    targetUserId: string;
    actorRole: Role;
    dto: {
      email?: string;
      name?: string | null;
      phone?: string | null;
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
      const updated = await this.prisma.user.update({
        where: { id: targetUserId },
        data: {
          email: dto.email ?? undefined,
          name: dto.name ?? undefined,
          phone: dto.phone ?? undefined,
          role: dto.role ?? undefined,
          passwordHash,
        },
        select: { id: true, email: true, name: true, phone: true, role: true },
      });
      return updated;
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }
      throw e;
    }
  }
}
