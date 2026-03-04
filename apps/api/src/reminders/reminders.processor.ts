import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../notifications/telegram/telegram.service';
import {
  REMINDERS_QUEUE,
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

    if (!order || order.orderStatus !== OrderStatus.APPROVAL) {
      const repeatJobs = await this.queue.getJobSchedulers();

      const repeatJob = repeatJobs.find((j) => j.id === jobIdForOrder(orderId));

      if (repeatJob) {
        await this.queue.removeJobScheduler(repeatJob.key);
      }

      return;
    }

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
  }
}
