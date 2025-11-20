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
import path from 'path';
import * as fs from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

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

  // ===== Orders =====
  private PDFDocument: any;

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
        dateOfBirth: asDate(dto.dateOfBirth),
        dateOfDeath: asDate(dto.dateOfDeath),
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
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
    }

    // finish
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
    try {
      await this.mailer.sendOrderCreatedToManager(result);
      if (result.customerEmail)
        await this.mailer.sendOrderCreatedToClient(result);
    } catch (e) {
      console.error('MAIL_ERROR', e);
    }
    if (result.customerEmail) {
      await this.email.orderPlaced(
        result.customerEmail || '',
        result.number || '',
      );
    }

    if (user?.notifyChannel === 'TELEGRAM') {
      await this.telegram.orderPlaced(user.telegramChatId, result.number);
    }

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

  async generateOrderPdf(orderId: string): Promise<Buffer> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            size: true,
            frame: true,
            background: true,
            assets: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found for PDF');
    }

    if (!order.items) {
      throw new BadRequestException('Order has no items for PDF');
    }

    const item = order.items;

    // === 1) Загружаем PDF-шаблон ===
    const templatePath = path.resolve(
      process.cwd(),
      'src/orders/pdfs/order-template.pdf',
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`PDF template not found at ${templatePath}`);
    }

    const templateBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(templateBytes);
    (pdfDoc as any).registerFontkit(fontkit);

    const [page] = pdfDoc.getPages();

    const fontBytes = fs.readFileSync(
      path.resolve(process.cwd(), 'src/orders/fonts/roboto-regular.ttf'),
    );
    const font = await pdfDoc.embedFont(fontBytes);

    const draw = (
      text: string | null | undefined,
      x: number,
      y: number,
      size = 10,
    ) => {
      if (!text) return;
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    };

    const formatDate = (d?: Date | string | null) =>
      d ? (toDateString(d as any) ?? '') : '';

    // ===== 2. Координаты под order-template.pdf =====

    // Номер заказа (правый верхний)
    const ORDER_NUMBER_X = 430;
    const ORDER_NUMBER_Y = 815;

    // Левая колонка шапки (Организация / Пункт / Заказчик / Доставка)
    const HEADER_LEFT_X = 140;
    const HEADER_TOP_Y = 760; // "Организация"
    const HEADER_LINE = 18; // шаг между строками

    // Правая колонка шапки (даты)
    const HEADER_RIGHT_X = 420;
    const DATE_INTAKE_Y = 760; // "Дата приема"
    const DATE_ISSUE_Y = 742; // "Дата выдачи"

    // Согласование: да/нет (квадратики справа)
    const APPROVE_Y = 705;
    const APPROVE_YES_X = 505;
    const APPROVE_NO_X = 545;

    // Таблица материалов
    const TABLE_Y = 628; // строка значений
    const TABLE_MATERIAL_X = 28; // "Металлокерамика" колонка
    const TABLE_FRAME_X = 380; // "Рамка"
    const TABLE_BG_X = 445; // "Фон"
    const TABLE_SIZE_X = 505; // "Размер"

    // Комментарий и отверстия
    const COMMENT_X = 60;
    const COMMENT_Y = 603;
    const HOLES_Y = 603;
    const HOLES_YES_X = 505;
    const HOLES_NO_X = 545;

    // Блок ФИО/дат
    const FIO_X = 100;
    const FIO_LASTNAME_Y = 555;
    const FIO_FIRSTNAME_Y = 537;
    const FIO_MIDDLENAME_Y = 519;
    const FIO_BIRTH_Y = 502;
    const FIO_DEATH_Y = 484;

    // ===== 3. Заполнение полей =====

    // 3.1. Номер заказа в шапке (правый верхний)
    draw(
      order.orderNumber ?? order.number ?? order.id,
      ORDER_NUMBER_X,
      ORDER_NUMBER_Y,
      11,
    );

    // 3.2. Организация (можно взять из env)
    const orgName = process.env.ORDER_FORM_ORG_NAME ?? '';
    const orgCity = process.env.ORDER_FORM_ORG_CITY ?? '';
    const orgPhone = process.env.ORDER_FORM_ORG_PHONE ?? '';
    const orgEmail = process.env.ORDER_FORM_ORG_EMAIL ?? '';

    draw(orgName, HEADER_LEFT_X, HEADER_TOP_Y);
    draw(
      [orgCity, orgPhone, orgEmail].filter(Boolean).join(', '),
      HEADER_LEFT_X,
      HEADER_TOP_Y - HEADER_LINE,
    );

    // Пункт приёма
    draw(
      order.intakePoint || '',
      HEADER_LEFT_X,
      HEADER_TOP_Y - HEADER_LINE * 2,
    );

    // Заказчик (имя + телефон)
    const customerLine = [order.customerName, order.customerPhone]
      .filter(Boolean)
      .join(', ');
    draw(customerLine, HEADER_LEFT_X, HEADER_TOP_Y - HEADER_LINE * 3);

    // Доставка
    draw(order.delivery || '', HEADER_LEFT_X, HEADER_TOP_Y - HEADER_LINE * 4);

    // Дата приёма / дата выдачи (правый столбец)
    const intakeDateStr = formatDate(order.intakeDate);
    draw(intakeDateStr, HEADER_RIGHT_X, DATE_INTAKE_Y);

    // Пока оставим дату выдачи пустой (клиент впишет руками)
    const issueDateStr = ''; // либо formatDate(order.issueDate), если добавишь поле
    draw(issueDateStr, HEADER_RIGHT_X, DATE_ISSUE_Y);

    // Согласование: крестик в да/нет
    const approve = order.approveNeeded ?? item.approveNeeded ?? false;
    draw(approve ? 'X' : '', APPROVE_YES_X, APPROVE_Y); // "да"
    draw(!approve ? 'X' : '', APPROVE_NO_X, APPROVE_Y); // "нет"

    // 3.3. Таблица: материал / рамка / фон / размер
    const sizeLabel = item.size?.label ?? '';
    const frameLabel = item.frame?.name ?? '';
    const backgroundLabel = item.background?.name ?? '';
    const material = item.templateLabel ?? '';

    draw(material, TABLE_MATERIAL_X, TABLE_Y);
    draw(frameLabel, TABLE_FRAME_X, TABLE_Y);
    draw(backgroundLabel, TABLE_BG_X, TABLE_Y);
    draw(sizeLabel, TABLE_SIZE_X, TABLE_Y);

    // 3.4. Комментарий
    draw(item.comment ?? '', COMMENT_X, COMMENT_Y);

    // 3.5. Отверстия
    const hasHoles = !!item.holePattern;
    draw(hasHoles ? 'X' : '', HOLES_YES_X, HOLES_Y);
    draw(!hasHoles ? 'X' : '', HOLES_NO_X, HOLES_Y);

    // 3.6. ФИО
    draw(item.lastName ?? '', FIO_X, FIO_LASTNAME_Y);
    draw(item.firstName ?? '', FIO_X, FIO_FIRSTNAME_Y);
    draw(item.middleName ?? '', FIO_X, FIO_MIDDLENAME_Y);

    // 3.7. Даты рождения / смерти
    const dob = formatDate(item.dateOfBirth);
    const dod = formatDate(item.dateOfDeath);

    draw(dob, FIO_X, FIO_BIRTH_Y);
    draw(dod, FIO_X, FIO_DEATH_Y);

    // ===== 4. Сохранение =====
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
