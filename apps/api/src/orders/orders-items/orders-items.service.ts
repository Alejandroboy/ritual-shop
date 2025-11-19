import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApprovalStage, OrderStatus } from '@prisma/client';
import { AdminOrdersService } from '../../admin/admin-orders/admin-orders.service';
import { ApproveDto } from '../dto/approve.dto';

@Injectable()
export class OrdersItemsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminOrdersService: AdminOrdersService,
  ) {}

  async getById(id: string, itemId: string) {
    return this.prismaService.orderItem.findFirst({
      where: { id: itemId, orderId: id },
      include: {
        size: true,
        assets: true,
      },
    });
  }

  async changeApprovalStage(
    orderId: string,
    itemId: string,
    stage: ApprovalStage,
    userId,
  ) {
    if (stage === ApprovalStage.IN_PROGRESS) {
      await this.adminOrdersService.updateStatus(orderId, {
        status: OrderStatus.APPROVAL,
        userId: userId,
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

  async updateApproval(orderId: string, itemId: string, dto: ApproveDto) {
    await this.adminOrdersService.updateStatus(orderId, {
      status: OrderStatus.IN_PROGRESS,
      userId: dto.userId,
    });
    return this.prismaService.orderItem.update({
      where: { id: itemId, orderId },
      data: {
        approved: true,
        approvalStage: ApprovalStage.APPROVED,
        userActionNeeded: null,
        managerActionNeeded: null,
      },
    });
  }

  async updateComment(orderId: string, itemId: string, text) {
    return this.prismaService.orderItem.update({
      where: { id: itemId, orderId },
      data: {
        managerActionNeeded: true,
        userActionNeeded: false,
        discussComment: text,
      },
    });
  }
}
