import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class TelegramService {
  private readonly log = new Logger(TelegramService.name);
  private get token() {
    return process.env.TELEGRAM_BOT_TOKEN!;
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

  buildStatusText(order: { number: string; orderStatus: string; id: string }) {
    const map: Record<string, string> = {
      [OrderStatus.ACCEPTED]: 'Принят',
      [OrderStatus.IN_PROGRESS]: 'В работе',
      [OrderStatus.APPROVAL]: 'Согласование',
      [OrderStatus.SENT]: 'Отправлен',
      [OrderStatus.READY]: 'Готов',
      [OrderStatus.CANCELLED]: 'Отменен',
    };
    const human = map[order.orderStatus] ?? order.orderStatus;
    const link = `${process.env.PUBLIC_SITE_ORIGIN}/order/${order.id}`;
    return [
      `Заказ №${order.number}: статус <b>${human}</b>.`,
      `Детали: ${link}`,
      `Если есть вопросы — просто ответьте на это сообщение.`,
    ].join('\n');
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
    return this.sendMessage(
      telegramChatId,
      `Статус заказа № ${orderNumber} изменился: ${oldStatus} → ${newStatus}`,
    );
  }
}
