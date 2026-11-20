import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApprovalStage, OrderStatus } from '@prisma/client';
import { AdminOrdersService } from '../../admin/admin-orders/admin-orders.service';
import { EmailService } from '../../email/email.service';
import { TelegramService } from '../../notifications/telegram/telegram.service';
import { ConfigurationService } from '../../config/configuration.service';

@Injectable()
export class OrdersItemsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminOrdersService: AdminOrdersService,
    private readonly email: EmailService,
    private readonly telegram: TelegramService,
    private readonly config: ConfigurationService,
  ) {}

  private async getOrderContacts(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        customerEmail: true,
        customer: { select: { email: true, telegramChatId: true } },
      },
    });
    return {
      orderNumber: order?.orderNumber ?? orderId,
      customerEmail: order?.customerEmail ?? order?.customer?.email ?? null,
      telegramChatId: order?.customer?.telegramChatId ?? null,
    };
  }

  async getById(id: string, itemId: string) {
    return this.prismaService.orderItem.findFirst({
      where: { id: itemId, orderId: id },
      include: {
        size: true,
        assets: true,
        background: true,
        frame: true,
        template: {
          include: {
            allowedSizes: true,
            finishPrices: true,
          },
        },
        discussComments: {
          select: { id: true, text: true, date: true, userName: true },
          orderBy: { date: 'desc' },
        },
      },
    });
  }

  async changeApprovalStage(
    orderId: string,
    itemId: string,
    stage: ApprovalStage,
  ) {
    if (stage === ApprovalStage.IN_PROGRESS) {
      await this.adminOrdersService.updateStatus(orderId, {
        status: OrderStatus.APPROVAL,
      });
    }
    return this.prismaService.orderItem.update({
      where: { id: itemId, orderId },
      data: {
        approvalStage: stage,
      },
    });
  }

  async changeUserActionNeeded(orderId: string, itemId: string) {
    return this.prismaService.orderItem.update({
      where: { id: itemId, orderId },
      data: {
        userActionNeeded: true,
        managerActionNeeded: false,
      },
    });
  }

  async updateApproval(orderId: string, itemId: string) {
    const result = await this.prismaService.orderItem.update({
      where: { id: itemId, orderId },
      data: {
        approved: true,
        approvalStage: ApprovalStage.APPROVED,
        userActionNeeded: null,
        managerActionNeeded: null,
      },
    });

    const { orderNumber } = await this.getOrderContacts(orderId);
    this.email
      .itemApproved(this.config.get('ADMIN_EMAIL'), orderNumber)
      .catch(() => {});

    return result;
  }

  async updateComment(orderId: string, itemId: string, text: string) {
    const result = await this.prismaService.orderItem.update({
      where: { id: itemId, orderId },
      data: {
        managerActionNeeded: true,
        userActionNeeded: false,
        discussComment: text,
        discussComments: {
          create: { text },
        },
      },
    });
    const { orderNumber, customerEmail, telegramChatId } =
      await this.getOrderContacts(orderId);
    if (customerEmail)
      this.email
        .newDiscussComment(customerEmail, orderNumber, text)
        .catch(() => {});
    if (telegramChatId)
      this.telegram
        .newDiscussComment(telegramChatId, orderNumber, text)
        .catch(() => {});
    return result;
  }

  async addComment(
    orderId: string,
    itemId: string,
    text: string,
    userName: string,
    userRole: string,
  ) {
    let managerActionNeeded = false;
    let userActionNeeded = false;
    if (userRole === 'CUSTOMER') {
      managerActionNeeded = true;
    }
    if (
      userRole === 'ADMIN_GOD' ||
      userRole === 'ADMIN' ||
      userRole === 'Manager'
    ) {
      userActionNeeded = true;
    }
    const result = await this.prismaService.orderItem.update({
      where: { id: itemId, orderId },
      data: {
        discussComments: {
          create: { text, userName },
        },
        managerActionNeeded,
        approvalStage: ApprovalStage.IN_PROGRESS,
        userActionNeeded,
      },
    });

    const { orderNumber, customerEmail, telegramChatId } =
      await this.getOrderContacts(orderId);

    const isAdmin =
      userRole === 'ADMIN_GOD' ||
      userRole === 'ADMIN' ||
      userRole === 'Manager';

    if (isAdmin) {
      if (customerEmail)
        this.email
          .newDiscussComment(customerEmail, orderNumber, text)
          .catch(() => {});
      if (telegramChatId)
        this.telegram
          .newDiscussComment(telegramChatId, orderNumber, text)
          .catch(() => {});
    } else {
      this.email
        .newDiscussComment(this.config.get('ADMIN_EMAIL'), orderNumber, text)
        .catch(() => {});
    }

    return result;
  }
}
