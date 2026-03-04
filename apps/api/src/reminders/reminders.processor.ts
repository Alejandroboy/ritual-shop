import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../notifications/telegram/telegram.service';
import {
  REMINDERS_QUEUE,
  APPROVAL_REPEAT_DELAY_MS,
  jobIdForOrder,
  ReminderJobData,
} from './reminders.constants';
import { OrderStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Processor(REMINDERS_QUEUE)
export class RemindersProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
    private readonly emailService: EmailService,
    @InjectQueue(REMINDERS_QUEUE) private readonly queue: Queue,
  ) {
    super();
  }

  async process(job: Job<ReminderJobData>) {
    const { orderId, userId, orderNumber } = job.data;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { orderStatus: true },
    });

    if (!order || order.orderStatus !== OrderStatus.APPROVAL) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true, email: true },
    });

    if (user?.telegramChatId) {
      await this.telegram.orderStatusApprovalReminder(
        user.telegramChatId,
        orderNumber,
      );
    }
    if (user?.email) {
      await this.emailService.orderStatusApprovalReminder(
        user.email,
        orderNumber,
      );
    }

    await this.queue.add('approval-reminder', job.data, {
      jobId: jobIdForOrder(orderId),
      delay: APPROVAL_REPEAT_DELAY_MS,
      removeOnComplete: true,
      removeOnFail: 50,
    });
  }
}
