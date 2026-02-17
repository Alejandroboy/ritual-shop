import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class TelegramService {
  private readonly log = new Logger(TelegramService.name);
  private get token() {
    return process.env.TELEGRAM_BOT_TOKEN!;
  }

  private get webUrl() {
    return (process.env.PUBLIC_WEB_URL || process.env.APP_URL || '').replace(
      /\/$/,
      '',
    );
  }

  async sendMessage(chatId: string | null, text: string | null, html = false) {
    const res = await fetch(
      `https://api.telegram.org/bot${this.token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: html ? 'HTML' : undefined,
          disable_web_page_preview: true,
        }),
      },
    );
    if (!res.ok) {
      const m = await res.text();
      this.log.error(`Telegram error: ${res.status} ${m}`);
    }
  }

  async orderPlaced(chatId: string | null, orderNumber: string) {
    return this.sendMessage(
      chatId,
      `Здравствуйте! Ваш заказ №${orderNumber} принят`,
    );
  }

  async orderStatusChanged(
    telegramChatId: string,
    orderNumber: string,
    oldStatus: string,
    newStatus: string,
  ) {
    const map: Record<string, string> = {
      [OrderStatus.ACCEPTED]: 'Принят',
      [OrderStatus.IN_PROGRESS]: 'В работе',
      [OrderStatus.APPROVAL]: 'Согласование',
      [OrderStatus.SENT]: 'Отправлен',
      [OrderStatus.READY]: 'Готов',
      [OrderStatus.CANCELLED]: 'Отменен',
    };
    const humanOldStatus = map[oldStatus] ?? oldStatus;
    const humanNewStatus = map[newStatus] ?? newStatus;
    if (newStatus === 'APPROVAL') {
      return this.sendMessage(
        telegramChatId,
        `Статус заказа №${orderNumber} изменился: ${humanOldStatus} → ${humanNewStatus}. Пожалуйста зайдите в личный кабинет и согласуйте ретушь`,
      );
    }
    return this.sendMessage(
      telegramChatId,
      `Статус заказа №${orderNumber} изменился: ${humanOldStatus} → ${humanNewStatus}`,
    );
  }

  async orderStatusApprovalReminder(
    telegramChatId: string,
    orderNumber: string,
  ) {
    const link = this.webUrl
      ? `\n\nЛичный кабинет: ${this.webUrl}/account`
      : '';
    return this.sendMessage(
      telegramChatId,
      `Напоминание: заказ №${orderNumber} ждёт согласования ретуши.\nПожалуйста откройте личный кабинет и подтвердите.${link}`,
    );
  }
}
