import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApprovalStage } from '@prisma/client';

@Injectable()
export class OrdersItemsService {
  constructor(private readonly prismaService: PrismaService) {}

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
  ) {
    return this.prismaService.orderItem.update({
      where: { id: itemId, orderId },
      data: {
        approvalStage: stage,
      },
    });
  }

  async updateApproval(orderId: string, itemId: string) {
    return this.prismaService.orderItem.update({
      where: { id: itemId, orderId },
      data: {
        approved: true,
        approvalStage: 'APPROVED',
      },
    });
  }
}
