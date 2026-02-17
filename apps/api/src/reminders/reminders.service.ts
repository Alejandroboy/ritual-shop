import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  REMINDERS_QUEUE,
  APPROVAL_FIRST_DELAY_MS,
  jobIdForOrder,
  ReminderJobData,
} from './reminders.constants';

@Injectable()
export class RemindersService {
  constructor(@InjectQueue(REMINDERS_QUEUE) private readonly queue: Queue) {}

  async startApprovalReminder(data: ReminderJobData) {
    const existing = await this.queue.getJob(jobIdForOrder(data.orderId));
    if (existing) await existing.remove();

    await this.queue.add('approval-reminder', data, {
      jobId: jobIdForOrder(data.orderId),
      delay: APPROVAL_FIRST_DELAY_MS,
      removeOnComplete: true,
      removeOnFail: 50,
    });
  }

  async stopApprovalReminder(orderId: string) {
    const job = await this.queue.getJob(jobIdForOrder(orderId));
    if (job) await job.remove();
  }
}
