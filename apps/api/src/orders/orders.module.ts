import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../common/mailer.service';
import { AssetsModule } from '../assets/assets.module';
import { EmailModule } from '../email/email.module';
import { TelegramModule } from '../notifications/telegram/telegram.module';
import { S3Module } from '../s3/s3.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, MailerService],
  exports: [OrdersService],
  imports: [AssetsModule, EmailModule, TelegramModule, S3Module],
})
export class OrdersModule {}
