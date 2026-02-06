import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Finish, HolePattern, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-item.dto';
import { AddAssetDto } from './dto/add-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderItemDto } from './dto/update-item.dto';
import { MailerService } from '../common/mailer.service';
import { CheckoutDto } from './dto/checkout.dto';
import { AssetsService } from '../assets/assets.service';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { EmailService } from '../email/email.service';
import { TelegramService } from '../notifications/telegram/telegram.service';
import { asDate, toDateString } from '../common/helpers';

type OrderDto = {
  id: string;
  items: Array<{
    id: string;
    templateLabel: string;
    size?: { label?: string } | null;
    comment?: string | null;
    assets: Array<{
      id: string;
      kind: string;
      originalName?: string | null;
      contentType?: string | null;
      size?: number | null;
      viewUrl: string;
      downloadUrl: string;
      expiresIn: number;
    }>;
  }>;
};

function pad(n: number, len: number) {
  return n.toString().padStart(len, '0');
}
function todayPrefix() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private mailer: MailerService,
    private email: EmailService,
    private telegram: TelegramService,
    private readonly assets: AssetsService,
  ) {}

  private genNumber(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const rnd = Math.floor(1000 + Math.random() * 9000);
    return `${ymd}-${rnd}`;
  }

  async createOrder(dto: CreateOrderDto) {
    let number = dto?.number?.trim();
    for (let i = 0; i < 3 && !number; i++) number = this.genNumber();
    try {
      return this.prisma.order.create({
        data: {
          number: dto?.number ?? this.genNumber(),
          customerName: dto?.customerName || '',
          customerPhone: dto?.customerPhone || '',
          intakePoint: dto?.intakePoint || '',
          delivery: dto?.delivery || '',
          intakeDate: dto?.intakeDate || new Date().toISOString(),
          approveNeeded: dto?.approveNeeded ?? false,
        },
      });
    } catch (e: any) {
      console.log('createOrder error', e);
      if ((e as Prisma.PrismaClientKnownRequestError)?.code === 'P2002') {
        throw new BadRequestException('Order number already exists');
      }
      throw e;
    }
  }

  async listOrders(page = 1, pageSize = 20) {
    const take = Math.max(1, Math.min(100, Number(pageSize) || 20));
    const skip = Math.max(0, (Number(page) || 1) - 1) * take;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.order.count(),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          number: true,
          customerName: true,
          createdAt: true,
          items: {
            select: { id: true, templateCode: true, templateLabel: true },
          },
        },
      }),
    ]);

    return { total, page, pageSize: take, items };
  }

  async getOrder(id: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            size: true,
            assets: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const rawItem = order.items;

    const items = rawItem
      ? [
          {
            id: rawItem.id,
            templateLabel: rawItem.templateLabel,
            size: rawItem.size ? { label: rawItem.size.label } : null,
            approveNeeded: rawItem.approveNeeded ?? null,
            retouchNeeded: rawItem.retouchNeeded ?? null,
            comment: rawItem.comment ?? null,
            dateOfBirth: toDateString(rawItem.dateOfBirth),
            dateOfDeath: toDateString(rawItem.dateOfDeath),
            firstName: rawItem.firstName ?? null,
            middleName: rawItem.middleName ?? null,
            lastName: rawItem.lastName ?? null,
            sizeId: rawItem.sizeId,
            holePattern: rawItem.holePattern,
            frameId: rawItem.frameId,
            backgroundId: rawItem.backgroundId,
            finish: rawItem.finish,
            assets: await Promise.all(
              rawItem.assets.map((a) => this.assets.toDtoWithUrls(a)),
            ),
          },
        ]
      : [];

    return { id: order.id, items };
  }
  async getOrdersForUser(userId: string): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { size: true, assets: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    return Promise.all(
      orders.map(async (o) => ({
        id: o.id,
        items: o.items
          ? [
              {
                id: o.items.id,
                templateLabel: o.items.templateLabel,
                size: o.items.size ? { label: o.items.size.label } : null,
                comment: o.items.comment ?? null,
                assets: await Promise.all(
                  o.items.assets.map((a) => this.assets.toDtoWithUrls(a)),
                ),
              },
            ]
          : [],
      })),
    );
  }

  async addItem(orderId: string, dto: AddOrderItemDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found 2');

    const tpl = await this.prisma.template.findUnique({
      where: { code: dto.templateCode },
      include: {
        allowedSizes: { select: { sizeId: true } },
        allowedFrames: { select: { frameId: true } },
        allowedBackgrounds: { select: { backgroundId: true } },
        allowedHoles: { select: { pattern: true } },
        allowedFinishes: { select: { finish: true } },
        variants: {
          select: {
            holePattern: true,
            finishRequired: true,
            allowedFinishes: {
              select: { finish: { select: { id: true, code: true } } },
            },
          },
        },
      },
    });
    if (!tpl) throw new BadRequestException('Unknown templateCode');

    const sizeAllowed = (id?: number) =>
      !id || tpl.allowedSizes.some((s) => s.sizeId === id);

    const frameAllowed = (id?: number) =>
      !id ||
      (tpl.supportsFrame && tpl.allowedFrames.some((f) => f.frameId === id));

    const bgAllowed = (id?: number) =>
      !id || tpl.allowedBackgrounds.some((b) => b.backgroundId === id);

    const holeAllowed = (p?: HolePattern) =>
      !p || tpl.allowedHoles.some((h) => h.pattern === p);

    const variant = dto.holePattern
      ? tpl.variants.find((v) => v.holePattern === dto.holePattern)
      : undefined;

    const finishRequired =
      tpl.requiresFinish || variant?.finishRequired || false;

    const allowedFinishes = new Set<Finish>();
    tpl.allowedFinishes.forEach((f) => allowedFinishes.add(f.finish));
    variant?.allowedFinishes.forEach((vf) => {
      const code = vf.finish.code as unknown as Finish;
      if (code === 'MATTE' || code === 'GLOSS') allowedFinishes.add(code);
    });

    if (!sizeAllowed(dto.sizeId)) {
      throw new BadRequestException('Size is not allowed for this template');
    }
    if (!holeAllowed(dto.holePattern)) {
      throw new BadRequestException(
        'Hole pattern is not allowed for this template',
      );
    }
    if (!frameAllowed(dto.frameId)) {
      if (!tpl.supportsFrame && dto.frameId) {
        throw new BadRequestException(
          'Frames are not supported for this template',
        );
      }
      throw new BadRequestException('Frame is not allowed for this template');
    }
    if (tpl.requiresBackground && !dto.backgroundId) {
      throw new BadRequestException('Background is required for this template');
    }
    if (!bgAllowed(dto.backgroundId)) {
      throw new BadRequestException(
        'Background is not allowed for this template',
      );
    }

    if (finishRequired && !dto.finish) {
      throw new BadRequestException(
        'Finish is required for this template/variant',
      );
    }
    if (dto.finish && !allowedFinishes.has(dto.finish)) {
      throw new BadRequestException(
        'Finish is not allowed for this template/variant',
      );
    }

    const item = await this.prisma.orderItem.create({
      data: {
        orderId,
        templateId: tpl.id,
        templateCode: tpl.code,
        templateLabel: tpl.label,
        templateFullTitle: tpl.fullTitle,
        dateOfBirth: asDate(dto.dateOfBirth),
        dateOfBirthSecondPerson: asDate(dto.dateOfBirthSecondPerson),
        dateOfDeath: asDate(dto.dateOfDeath),
        dateOfDeathSecondPerson: asDate(dto.dateOfDeathSecondPerson),
        firstName: dto.firstName,
        firstNameSecondPerson: dto.firstNameSecondPerson,
        middleName: dto.middleName,
        middleNameSecondPerson: dto.middleNameSecondPerson,
        lastName: dto.lastName,
        lastNameSecondPerson: dto.lastNameSecondPerson,
        sizeId: dto.sizeId,
        holePattern: dto.holePattern,
        frameId: dto.frameId,
        backgroundId: dto.backgroundId,
        finish: dto.finish,
        comment: dto.comment ?? null,
        approveNeeded: dto.approveNeeded,
        retouchNeeded: dto.retouchNeeded,
      },
      include: {
        size: true,
        frame: true,
        background: true,
      },
    });

    return item;
  }

  async addAsset(orderId: string, itemId: string, dto: AddAssetDto) {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });
    if (!item) throw new NotFoundException('Order item not found');

    return this.prisma.orderItemAsset.create({
      data: {
        orderItemId: itemId,
        originalName: dto.originalName,
        size: dto.size,
        bucket: dto.bucket,
        key: dto.key,
        storage: dto.storage,
        contentType: dto.contentType,
        etag: dto.etag,
      },
    });
  }

  async updateOrder(orderId: string, dto: UpdateOrderDto) {
    await this.ensureOrder(orderId);

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        intakePoint: dto.intakePoint,
        delivery: dto.delivery,
        approveNeeded: dto.approveNeeded,
        intakeDate: dto.intakeDate ? new Date(dto.intakeDate) : undefined,
      },
    });
  }

  async updateItem(orderId: string, itemId: string, dto: UpdateOrderItemDto) {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
      include: { template: true },
    });
    if (!item) throw new NotFoundException('Order item not found');

    let templateId = item.templateId;
    let templateCode = item.templateCode;
    let templateLabel = item.templateLabel;

    if (dto.templateCode) {
      const tpl = await this.prisma.template.findUnique({
        where: { code: dto.templateCode },
      });
      if (!tpl) throw new BadRequestException('Template code is invalid');
      templateId = tpl.id;
      templateCode = tpl.code;
      templateLabel = tpl.label;
    }

    const candidate = {
      templateId,
      sizeId: dto.sizeId ?? item.sizeId ?? undefined,
      holePattern: dto.holePattern ?? item.holePattern ?? undefined,
      frameId: dto.frameId ?? item.frameId ?? undefined,
      backgroundId: dto.backgroundId ?? item.backgroundId ?? undefined,
      finish: dto.finish ?? item.finish ?? undefined,
      approveNeeded: dto.approveNeeded ?? item.approveNeeded ?? undefined,
      retouchNeeded: dto.retouchNeeded ?? item.retouchNeeded ?? undefined,
    };

    await this.validateItemOptions(candidate);

    const data: Prisma.OrderItemUpdateInput = {
      comment: dto.comment,
      size: dto.sizeId ? { connect: { id: dto.sizeId } } : undefined,
      frame: dto.frameId
        ? { connect: { id: dto.frameId } }
        : dto.frameId === null
          ? { disconnect: true }
          : undefined,
      background: dto.backgroundId
        ? { connect: { id: dto.backgroundId } }
        : dto.backgroundId === null
          ? { disconnect: true }
          : undefined,
      holePattern: dto.holePattern,
      finish: dto.finish,
      template: dto.templateCode ? { connect: { id: templateId } } : undefined,
      approveNeeded: dto.approveNeeded ? dto.approveNeeded : false,
      retouchNeeded: dto.retouchNeeded ? dto.retouchNeeded : false,
      templateCode,
      templateLabel,
    };

    return this.prisma.orderItem.update({ where: { id: itemId }, data });
  }

  async updateAsset(
    orderId: string,
    itemId: string,
    assetId: string,
    dto: UpdateAssetDto,
  ) {
    await this.ensureItem(orderId, itemId);
    const asset = await this.prisma.orderItemAsset.findFirst({
      where: { id: assetId, orderItemId: itemId },
    });
    if (!asset) throw new NotFoundException('Asset not found');

    if (dto.primary === true) {
      await this.prisma.orderItemAsset.updateMany({
        where: { orderItemId: itemId, NOT: { id: assetId } },
        data: { primary: false },
      });
    }

    return this.prisma.orderItemAsset.update({
      where: { id: assetId },
      data: {
        originalName: dto.filename,
        primary: dto.primary,
      },
    });
  }

  async removeAsset(orderId: string, itemId: string, assetId: string) {
    await this.ensureItem(orderId, itemId);
    const asset = await this.prisma.orderItemAsset.findFirst({
      where: { id: assetId, orderItemId: itemId },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    await this.prisma.orderItemAsset.delete({ where: { id: assetId } });
    return { ok: true };
  }

  async removeItem(orderId: string, itemId: string) {
    await this.ensureItem(orderId, itemId);
    await this.prisma.orderItem.delete({ where: { id: itemId } });
    return { ok: true };
  }

  private async ensureOrder(orderId: string) {
    const exists = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!exists) throw new NotFoundException('Order not found 3');
  }

  private async ensureItem(orderId: string, itemId: string) {
    const exists = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });
    if (!exists) throw new NotFoundException('Order item not found');
  }

  private async validateItemOptions(input: {
    templateId: string;
    sizeId?: number | null;
    holePattern?: HolePattern | null;
    frameId?: number | null;
    backgroundId?: number | null;
    finish?: Finish | null;
  }) {
    const tpl = await this.prisma.template.findUnique({
      where: { id: input.templateId },
      include: {
        allowedSizes: { include: { size: true } },
        allowedHoles: true,
        allowedFrames: { include: { frame: true } },
        allowedBackgrounds: { include: { background: true } },
        allowedFinishes: true,
        variants: true,
      },
    });
    if (!tpl) throw new BadRequestException('Template not found');

    if (input.sizeId) {
      const ok = tpl.allowedSizes.some((s) => s.sizeId === input.sizeId);
      if (!ok)
        throw new BadRequestException('Size is not allowed for template');
    }

    if (input.holePattern) {
      const ok = tpl.allowedHoles.some((h) => h.pattern === input.holePattern);
      if (!ok)
        throw new BadRequestException(
          'Hole pattern is not allowed for template',
        );
    }

    if (input.frameId) {
      if (!tpl.supportsFrame)
        throw new BadRequestException('Template does not support frames');
      const ok = tpl.allowedFrames.some((f) => f.frameId === input.frameId);
      if (!ok)
        throw new BadRequestException('Frame is not allowed for template');
    }

    if (input.backgroundId) {
      if (tpl.requiresBackground)
        throw new BadRequestException(
          'Background is not applicable to this template',
        );
      const ok = tpl.allowedBackgrounds.some(
        (b) => b.backgroundId === input.backgroundId,
      );
      if (!ok)
        throw new BadRequestException('Background is not allowed for template');
    } else if (tpl.requiresBackground) {
    }

    if (input.finish) {
      const ok = tpl.allowedFinishes.some((f) => f.finish === input.finish);
      if (!ok)
        throw new BadRequestException('Finish is not allowed for template');
      const variant = tpl.variants.find(
        (v) => v.holePattern === (input.holePattern ?? null),
      );
      if (variant?.finishRequired && !input.finish) {
        throw new BadRequestException('Finish is required for this variant');
      }
    }
  }

  async checkout(id: string, dto: CheckoutDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found 4');
    if (!order.items) throw new BadRequestException('Order has no items');

    const datePrefix = todayPrefix();
    const result = await this.prisma.$transaction(async (tx) => {
      const countToday = await tx.order.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      });
      const number = `RS-${datePrefix}-${pad(countToday + 1, 4)}`;

      return tx.order.update({
        where: { id },
        data: {
          orderStatus: OrderStatus.ACCEPTED,
          orderNumber: number,
          customerName: dto.name,
          customerPhone: dto.phone,
          customerEmail: dto.email ?? null,
          customerId: dto.userId,
        },
        include: {
          items: { include: { assets: true } },
          customer: true,
        },
      });
    });

    const item = result.items;
    if (item?.assets?.length) {
      await Promise.all(
        item.assets.map((asset) => {
          const ext =
            asset.originalName?.split('.').pop()?.toLowerCase() ||
            asset.contentType?.split('/').pop() ||
            'bin';

          const fileName = `${result.orderNumber}.${ext}`;

          return this.prisma.orderItemAsset.update({
            where: { id: asset.id },
            data: { fileName },
          });
        }),
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: {
        telegramChatId: true,
        notifyChannel: true,
      },
    });

    // Письма
    // try {
    //   await this.mailer.sendOrderCreatedToManager(result);
    //   if (result.customerEmail)
    //     await this.mailer.sendOrderCreatedToClient(result);
    // } catch (e) {
    //   console.error('MAIL_ERROR', e);
    // }
    // if (result.customerEmail) {
    //   await this.email.orderPlaced(
    //     result.customerEmail || '',
    //     result.number || '',
    //   );
    // }
    //
    // if (user?.notifyChannel === 'TELEGRAM') {
    //   await this.telegram.orderPlaced(user.telegramChatId, result.number);
    // }

    return result;
  }

  async changeOrderStatus(id: string, dto: ChangeOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        orderStatus: true,
      },
    });

    if (order?.orderStatus === dto.status) return;

    return this.prisma.order.update({
      where: { id },
      data: { orderStatus: dto.status },
    });
  }
}
