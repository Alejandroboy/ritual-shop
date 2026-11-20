import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigurationService } from '../config/configuration.service';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string | undefined;

  constructor(private readonly config: ConfigurationService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get('SMTP_PORT') ?? 587,
      secure: false,
      auth: { user: config.get('SMTP_USER'), pass: config.get('SMTP_PASS') },
    });
    this.from = config.get('MAIL_FROM') ?? config.get('SMTP_USER');
  }

  async sendOrderCreatedToManager(order: any) {
    const to = this.config.get('MANAGER_EMAIL');
    if (!to) return;
    await this.transporter.sendMail({
      to,
      from: this.from,
      subject: `Новый заказ ${order.orderNumber || order.id}`,
      text: `Поступил новый заказ. Клиент: ${order.customerFullName}, тел: ${order.customerPhone}.`,
    });
  }

  async sendOrderCreatedToClient(order: any) {
    await this.transporter.sendMail({
      to: order.customerEmail,
      from: this.from,
      subject: `Ваш заказ ${order.orderNumber || order.id} принят`,
      text: `Спасибо! Мы приняли ваш заказ. Номер: ${order.orderNumber || order.id}.`,
    });
  }
}
