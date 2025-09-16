import { Module } from '@nestjs/common';
import { OrderItemsController } from './order-items.controller';
import { OrderItemsService } from './order-items.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [OrderItemsController],
  providers: [OrderItemsService, PrismaService],
})
export class OrderItemsModule {}
