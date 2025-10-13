import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  async sendOrderCreatedToManager(order: any) {
    const to = process.env.MANAGER_EMAIL;
    if (!to) return;
    await this.transporter.sendMail({
      to,
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      subject: `Новый заказ ${order.orderNumber || order.id}`,
      text: `Поступил новый заказ. Клиент: ${order.customerFullName}, тел: ${order.customerPhone}.`,
    });
  }

  async sendOrderCreatedToClient(order: any) {
    await this.transporter.sendMail({
      to: order.customerEmail,
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      subject: `Ваш заказ ${order.orderNumber || order.id} принят`,
      text: `Спасибо! Мы приняли ваш заказ. Номер: ${order.orderNumber || order.id}.`,
    });
  }
}
