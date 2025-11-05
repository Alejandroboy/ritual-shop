import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { createTransport } from './create-transport';

@Injectable()
export class EmailService {
  private readonly log = new Logger(EmailService.name);
  private readonly transporterP: Promise<Transporter>;

  constructor() {
    this.transporterP = createTransport();
  }

  async send(to: string, subject: string, html: string, text?: string) {
    const t = await this.transporterP;
    const from = process.env.SMTP_FROM || 'no-reply@example.com';

    const info = await t.sendMail({ from, to, subject, html, text });

    const url = (nodemailer as any).getTestMessageUrl?.(info);
    if (url) this.log.log(`Preview: ${url}`);

    this.log.log(`Email queued OK: ${subject} -> ${to}`);
    return info;
  }

  async orderPlaced(to: string, orderNumber: string) {
    return this.send(
      to,
      `Заказ №${orderNumber} принят`,
      `<p>Здравствуйте!</p><p>Ваш заказ <b>№${orderNumber}</b> принят.</p>`,
    );
  }

  async orderStatusChanged(
    to: string,
    orderNumber: string,
    oldStatus: string,
    newStatus: string,
  ) {
    return this.send(
      to,
      `Статус заказа №${orderNumber}: ${newStatus}`,
      `<p>Статус заказа <b>№${orderNumber}</b> изменился:</p><p><b>${oldStatus}</b> → <b>${newStatus}</b></p>`,
    );
  }
}
