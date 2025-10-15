import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Finish,
  HolePattern,
  Prisma,
  OrderStatus,
  AssetKind,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-item.dto';
import { AddAssetDto } from './dto/add-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderItemDto } from './dto/update-item.dto';
import { MailerService } from '../common/mailer.service';
import { CheckoutDto } from './dto/checkout.dto';
import { log } from '@adminjs/express';

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
  ) {}

  // ===== Orders =====

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
      const order = await this.prisma.order.create({
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
      return order;
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

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            size: true,
            frame: true,
            background: true,
            persons: true,
            assets: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found 1');
    return order;
  }

  // ===== Items =====

  async addItem(orderId: string, dto: AddOrderItemDto) {
    // 1) проверим заказ
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found 2');

    // 2) найдём шаблон и его разрешённые опции
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

    // 3) вычислим требование финиша
    const variant = dto.holePattern
      ? tpl.variants.find((v) => v.holePattern === dto.holePattern)
      : undefined;

    const finishRequired =
      tpl.requiresFinish || variant?.finishRequired || false;

    // список разрешённых финишей (из шаблона + из варианта, если есть)
    const allowedFinishes = new Set<Finish>();
    tpl.allowedFinishes.forEach((f) => allowedFinishes.add(f.finish));
    variant?.allowedFinishes.forEach((vf) => {
      // у варианта finish — это FinishVariant, у которого code = 'MATTE'|'GLOSS'
      const code = vf.finish.code as unknown as Finish;
      if (code === 'MATTE' || code === 'GLOSS') allowedFinishes.add(code);
    });

    // 4) валидация входных опций
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

    // 5) создаём позицию
    const item = await this.prisma.orderItem.create({
      data: {
        orderId,
        templateId: tpl.id,
        templateCode: tpl.code,
        templateLabel: tpl.label,

        sizeId: dto.sizeId,
        holePattern: dto.holePattern,
        frameId: dto.frameId,
        backgroundId: dto.backgroundId,
        finish: dto.finish,
        comment: dto.comment ?? null,
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

    const asset = await this.prisma.asset.create({
      data: {
        itemId,
        kind: dto.kind,
        filename: dto.filename,
        url: dto.url,
        primary: dto.primary ?? false,
        note: dto.note,
      },
    });
    return asset;
  }

  async updateOrder(orderId: string, dto: UpdateOrderDto) {
    // бросит NotFound, если нет
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

  // --- ITEM ---
  async updateItem(orderId: string, itemId: string, dto: UpdateOrderItemDto) {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
      include: { template: true },
    });
    if (!item) throw new NotFoundException('Order item not found');

    // возможно сменить шаблон по коду
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

    // собрать «кандидат» из текущего состояния + патча
    const candidate = {
      templateId,
      sizeId: dto.sizeId ?? item.sizeId ?? undefined,
      holePattern: dto.holePattern ?? item.holePattern ?? undefined,
      frameId: dto.frameId ?? item.frameId ?? undefined,
      backgroundId: dto.backgroundId ?? item.backgroundId ?? undefined,
      finish: dto.finish ?? item.finish ?? undefined,
    };

    // доменная валидация (разрешённые опции для шаблона)
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
      templateCode,
      templateLabel,
    };

    return this.prisma.orderItem.update({ where: { id: itemId }, data });
  }

  // --- ASSET ---
  async updateAsset(
    orderId: string,
    itemId: string,
    assetId: string,
    dto: UpdateAssetDto,
  ) {
    await this.ensureItem(orderId, itemId);
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, itemId },
    });
    if (!asset) throw new NotFoundException('Asset not found');

    if (dto.primary === true) {
      // снимаем primary у остальных
      await this.prisma.asset.updateMany({
        where: { itemId, NOT: { id: assetId } },
        data: { primary: false },
      });
    }

    return this.prisma.asset.update({
      where: { id: assetId },
      data: {
        filename: dto.filename,
        url: dto.url,
        note: dto.note,
        primary: dto.primary,
      },
    });
  }

  async removeAsset(orderId: string, itemId: string, assetId: string) {
    await this.ensureItem(orderId, itemId);
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, itemId },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    await this.prisma.asset.delete({ where: { id: assetId } });
    return { ok: true };
  }

  // --- DELETE ITEM ---
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

  /**
   * Проверяем, что size/frame/background/finish/holePattern разрешены данным шаблоном
   */
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

    // size
    if (input.sizeId) {
      const ok = tpl.allowedSizes.some((s) => s.sizeId === input.sizeId);
      if (!ok)
        throw new BadRequestException('Size is not allowed for template');
    }

    // hole pattern
    if (input.holePattern) {
      const ok = tpl.allowedHoles.some((h) => h.pattern === input.holePattern);
      if (!ok)
        throw new BadRequestException(
          'Hole pattern is not allowed for template',
        );
    }

    // frame
    if (input.frameId) {
      if (!tpl.supportsFrame)
        throw new BadRequestException('Template does not support frames');
      const ok = tpl.allowedFrames.some((f) => f.frameId === input.frameId);
      if (!ok)
        throw new BadRequestException('Frame is not allowed for template');
    }

    // background
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
      // если фон обязателен — либо его задаём, либо запрещаем убрать
      // (для PATCH — отсутствие поля значит «не меняем», это ок; но явный null/удаление запрещаем)
    }

    // finish
    if (input.finish) {
      const ok = tpl.allowedFinishes.some((f) => f.finish === input.finish);
      if (!ok)
        throw new BadRequestException('Finish is not allowed for template');
      // если у шаблона есть вариант с обязательным финишем (finishRequired) — можно дополнительно проверять
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
    if (!order.items.length)
      throw new BadRequestException('Order has no items');

    // Генерация номера (безопасно в транзакции)
    const datePrefix = todayPrefix();
    const result = await this.prisma.$transaction(async (tx) => {
      const countToday = await tx.order.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      });
      const number = `RS-${datePrefix}-${pad(countToday + 1, 4)}`;
      const updated = await tx.order.update({
        where: { id },
        data: {
          orderStatus: OrderStatus.ACCEPTED, // предполагается, что enum уже существует согласно ТЗ
          orderNumber: number, // если поля нет — добавьте его в Prisma schema как String @unique?
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
      return updated;
    });

    // Письма
    try {
      await this.mailer.sendOrderCreatedToManager(result);
      if (result.customerEmail)
        await this.mailer.sendOrderCreatedToClient(result);
    } catch (e) {
      // логируем, но не валим чекаут
      console.error('MAIL_ERROR', e);
    }

    return result;
  }

  async attachAssets(id: string, files: Express.Multer.File[]) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found 5');
    const toCreate = files.map((f) => ({
      itemId: id,
      kind: AssetKind.PHOTO, // предполагаемое поле kind в таблице ассетов
      filename: f.filename,
      url: `/uploads/orders/${f.filename}`,
      mime: f.mimetype,
      size: f.size,
    }));
    await this.prisma.asset.createMany({ data: toCreate });
    return { ok: true, count: files.length };
  }
}
