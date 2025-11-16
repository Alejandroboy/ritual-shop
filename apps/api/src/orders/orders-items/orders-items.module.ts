import { Module } from '@nestjs/common';
import {
  OrdersItemsController,
  OrdersItemsAdminController,
} from './orders-items.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersItemsService } from './orders-items.service';

@Module({
  controllers: [OrdersItemsController, OrdersItemsAdminController],
  providers: [PrismaService, OrdersItemsService],
  exports: [OrdersItemsService],
})
export class OrdersItemsModule {}
