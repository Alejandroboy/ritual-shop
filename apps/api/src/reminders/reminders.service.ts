import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  REMINDERS_QUEUE,
  APPROVAL_FIRST_DELAY_MS,
  jobIdForOrder,
  ReminderJobData,
  APPROVAL_REPEAT_DELAY_MS,
} from './reminders.constants';

@Injectable()
export class RemindersService {
  private readonly log = new Logger(RemindersService.name);
  constructor(@InjectQueue(REMINDERS_QUEUE) private readonly queue: Queue) {}

  async startApprovalReminder(data: {
    orderId: string;
    userId: string | undefined;
    orderNumber: any;
  }) {
    this.log.log(`startApprovalReminder orderId=${data.orderId}`);
    const existing = await this.queue.getJob(jobIdForOrder(data.orderId));
    if (existing) {
      this.log.log(`remove existing job ${jobIdForOrder(data.orderId)}`);
      await existing.remove();
    }

    await this.queue.add('approval-reminder', data, {
      jobId: jobIdForOrder(data.orderId),
      delay: APPROVAL_FIRST_DELAY_MS,
      repeat: {
        every: APPROVAL_REPEAT_DELAY_MS,
      },
      removeOnComplete: true,
      removeOnFail: 50,
    });

    this.log.log(`job added ${jobIdForOrder(data.orderId)}`);
  }

  async stopApprovalReminder(orderId: string) {
    const repeatJobs = await this.queue.getJobSchedulers();
    const job = repeatJobs.find((j) => j.id === jobIdForOrder(orderId));
    if (job) {
      await this.queue.removeJobScheduler(job.key);
    }
  }
}
