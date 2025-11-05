import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class WhatsAppProvider {
  private readonly token = process.env.WHATSAPP_TOKEN!;
  private readonly phoneId = process.env.WHATSAPP_PHONE_ID!; // ID номера в Cloud API

  canSend(order: any) {
    return order.notifyChannel === 'WHATSAPP' && !!order.whatsappPhone;
  }

  // Примечание: за пределами 24ч окна лучше слать шаблон (type: 'template')
  async sendStatusChange(order: any, text: string) {
    const url = `https://graph.facebook.com/v20.0/${this.phoneId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      to: order.whatsappPhone,
      type: 'text',
      text: { body: text },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const m = await res.text();
      throw new Error(`WhatsApp error: ${res.status} ${m}`);
    }
  }
}
