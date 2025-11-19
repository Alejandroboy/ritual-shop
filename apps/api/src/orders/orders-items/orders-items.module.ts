import { Module } from '@nestjs/common';
import {
  OrdersItemsController,
  OrdersItemsAdminController,
} from './orders-items.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersItemsService } from './orders-items.service';
import { AdminOrdersModule } from '../../admin/admin-orders/admin-orders.module';

@Module({
  controllers: [OrdersItemsController, OrdersItemsAdminController],
  providers: [PrismaService, OrdersItemsService],
  imports: [AdminOrdersModule],
  exports: [OrdersItemsService],
})
export class OrdersItemsModule {}
