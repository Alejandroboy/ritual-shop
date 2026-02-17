export const REMINDERS_QUEUE = 'approval-reminder';

export const APPROVAL_FIRST_DELAY_MS = 60_000; // тест: 1 мин
export const APPROVAL_REPEAT_DELAY_MS = 5 * 60_000; // тест: 5 мин

export const jobIdForOrder = (orderId: string) =>
  `approval-reminder__${orderId}`;

export type ReminderJobData = {
  orderId: string;
  userId: string;
  orderNumber: string;
};
