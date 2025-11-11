import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class TelegramProvider {
  private readonly token = process.env.TELEGRAM_BOT_TOKEN!;
  canSend(order: any) {
    return order.notifyChannel === 'TELEGRAM' && !!order.telegramChatId;
  }
  async sendStatusChange(order: any, text: string) {
    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
    const body = {
      chat_id: order.telegramChatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const m = await res.text();
      throw new Error(`Telegram error: ${res.status} ${m}`);
    }
  }
}
