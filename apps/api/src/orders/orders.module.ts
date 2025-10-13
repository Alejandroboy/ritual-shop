import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../common/mailer.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, MailerService],
  exports: [OrdersService],
})
export class OrdersModule {}
