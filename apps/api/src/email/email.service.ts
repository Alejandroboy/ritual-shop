import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { createTransport } from './create-transport';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly log = new Logger(EmailService.name);
  private readonly transporterP: Promise<Transporter>;

  constructor() {
    this.transporterP = createTransport();
  }

  private get webUrl() {
    return (process.env.PUBLIC_WEB_URL || process.env.APP_URL || '').replace(
      /\/$/,
      '',
    );
  }

  async send(to: string, subject: string, html: string, text?: string) {
    const t = await this.transporterP;
    const from = process.env.SMTP_FROM || 'no-reply@example.com';

    this.log.log(`Email queued OK: ${subject} -> ${to}`);
    try {
      const info = await t.sendMail({ from, to, subject, html, text });
      const url = (nodemailer as any).getTestMessageUrl?.(info);
      if (url) this.log.log(`Preview: ${url}`);
      return info;
    } catch (e: any) {
      this.log.error(`Email send FAILED: ${subject} -> ${to}`, e?.stack || e);
      throw e;
    }
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
    const map: Record<string, string> = {
      [OrderStatus.ACCEPTED]: 'Принят',
      [OrderStatus.IN_PROGRESS]: 'В работе',
      [OrderStatus.APPROVAL]: 'Согласование',
      [OrderStatus.COMPLETED]: 'Выполнен',
      [OrderStatus.READY]: 'Готов',
      [OrderStatus.CANCELLED]: 'Отменен',
    };
    const humanOldStatus = map[oldStatus] ?? oldStatus;
    const humanNewStatus = map[newStatus] ?? newStatus;
    if (newStatus === 'APPROVAL')
      return this.send(
        to,
        `Статус заказа №${orderNumber}: ${humanNewStatus}`,
        `<p>Статус заказа <b>№${orderNumber}</b> изменился:</p><p><b>${humanOldStatus}</b> → <b>${humanNewStatus}</b></p> <p><b>Пожалуйста зайдите в личный кабинет и согласуйте ретушь</b></p>`,
      );
    return this.send(
      to,
      `Статус заказа №${orderNumber}: ${humanNewStatus}`,
      `<p>Статус заказа <b>№${orderNumber}</b> изменился:</p><p><b>${humanOldStatus}</b> → <b>${humanNewStatus}</b></p>`,
    );
  }

  async orderStatusApprovalReminder(to: string, orderNumber: string) {
    const link = this.webUrl
      ? `<p>Личный кабинет: ${this.webUrl}/account</p>`
      : '';

    return this.send(
      to,
      `Напоминание: заказ №${orderNumber}: ждёт согласования ретуши`,
      `<p>Напоминание: заказ <b>№${orderNumber} </b>ждёт согласования ретуши.</p><p><b>Пожалуйста, откройте личный кабинет и подтвердите.${link}</b></p>`,
    );
  }
}
