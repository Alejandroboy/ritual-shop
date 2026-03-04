import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RemindersService } from './reminders.service';
import { RemindersProcessor } from './reminders.processor';
import { TelegramModule } from '../notifications/telegram/telegram.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

export const REMINDERS_QUEUE = 'approval-reminder';

@Module({
  imports: [
    BullModule.registerQueue({ name: REMINDERS_QUEUE }),
    PrismaModule,
    TelegramModule,
    EmailModule,
  ],
  providers: [RemindersService, RemindersProcessor],
  exports: [RemindersService],
})
export class RemindersModule {}
