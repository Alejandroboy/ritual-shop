import { Module } from '@nestjs/common';
import {
  OrdersItemsController,
  OrdersItemsAdminController,
} from './orders-items.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersItemsService } from './orders-items.service';
import { AdminOrdersModule } from '../../admin/admin-orders/admin-orders.module';
import { EmailModule } from '../../email/email.module';
import { TelegramModule } from '../../notifications/telegram/telegram.module';

@Module({
  controllers: [OrdersItemsController, OrdersItemsAdminController],
  providers: [PrismaService, OrdersItemsService],
  imports: [AdminOrdersModule, EmailModule, TelegramModule],
  exports: [OrdersItemsService],
})
export class OrdersItemsModule {}
