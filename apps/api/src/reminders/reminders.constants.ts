export const REMINDERS_QUEUE = 'approval-reminder';

export const APPROVAL_FIRST_DELAY_MS = 60_000; // тест: 1 мин
export const APPROVAL_REPEAT_DELAY_MS = 2 * 60_000; // тест: 5 мин

export const jobIdForOrder = (orderId: string) =>
  `approval-reminder:${orderId}`;

export type ReminderJobData = {
  orderId: string;
  userId: string;
  orderNumber: string;
};
