import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false, // обязательно false
    ignoreTLS: true, // для Mailhog
    auth: undefined, // Mailhog без авторизации
    tls: { rejectUnauthorized: false },
    // logger: true, debug: true, // включи для подробных логов
  });

  async sendTest(to = 'test@example.com') {
    await this.transporter.verify();
    return this.transporter.sendMail({
      from: 'dev@ritual.local',
      to,
      subject: 'Mailhog test',
      text: 'Привет! Это тест из Nest.',
    });
  }
}
