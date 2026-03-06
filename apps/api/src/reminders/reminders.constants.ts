export const REMINDERS_QUEUE = 'approval-reminder';

export const APPROVAL_FIRST_DELAY_MS = 60 * 60_000;
export const APPROVAL_REPEAT_DELAY_MS = 12 * 60 * 60_000; // тест: 5 мин

export const jobIdForOrder = (orderId: string) =>
  `approval-reminder:${orderId}`;

export type ReminderJobData = {
  orderId: string;
  userId: string;
  orderNumber: string;
};
