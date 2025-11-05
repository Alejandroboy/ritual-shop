import { Injectable, Logger } from '@nestjs/common';
// import { TelegramProvider } from './telegram.provider';
import { WhatsAppProvider } from './whatsapp.provider';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly log = new Logger(NotificationsService.name);
  constructor(
    // private readonly telegram: TelegramProvider,
    private readonly whatsapp: WhatsAppProvider,
  ) {}

  async onOrderStatusChanged(order: any) {
    const text = this.buildText(order);
    const providers = [this.whatsapp].filter((p) => p.canSend(order));
    for (const p of providers) {
      try {
        await p.sendStatusChange(order, text);
      } catch (e: any) {
        this.log.error(`Failed to notify (${order.number}): ${e.message}`);
      }
    }
  }

  private buildText(order: any) {
    const map: Record<string, string> = {
      [OrderStatus.ACCEPTED]: 'Принят',
      [OrderStatus.IN_PROGRESS]: 'В работе',
      [OrderStatus.APPROVAL]: 'Согласование',
      [OrderStatus.SENT]: 'Отправлен',
      [OrderStatus.READY]: 'Готов',
      [OrderStatus.CANCELLED]: 'Отменен',
    };
    const human = map[order.status] ?? order.status;
    const link = `${process.env.PUBLIC_SITE_ORIGIN}/order/${order.id}`;
    return [
      `Заказ №${order.number}: статус <b>${human}</b>.`,
      `Детали: ${link}`,
      `Если есть вопросы — просто ответьте на это сообщение.`,
    ].join('\n');
  }
}
