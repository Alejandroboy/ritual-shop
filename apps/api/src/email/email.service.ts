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

  async orderPlacedAdmin(
    to: string,
    order: {
      customerName: string;
      customerEmail: string;
      orderNumber: string;
      templateLabel: string;
      backgroundLabel: string;
      sizeLabel: string;
      frameLabel: string;
      holeLabel: string;
      finishLabel: string;
    },
  ): Promise<any> {
    return this.send(
      to,
      `Клиент ${order.customerName} совершил заказ №${order.orderNumber} `,
      `<p>
      Здравствуйте!</p>
      <p>Клиент <b>${order.customerName}</b> с почтой <b>${order.customerEmail}</b> совершил заказ <b>№${order.orderNumber}</b>
      </p>
      <p>Заказ: </p>
      <p>
        <ul>
          <li>Шаблон:${order.templateLabel}</li>
          <li>${order.backgroundLabel}</li>
          <li>Размер:${order.sizeLabel}</li>
          <li>Рамка:${order.frameLabel}</li>
          <li>Отверстия:${order.holeLabel}</li>
          <li>Финиш:${order.finishLabel}</li>
        </ul>
      </p>                         
  `,
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
// result {
//     id: 'cmnh1m8tg00025b3l8fqpmf4q',
//       number: 'ZO66-20260402-0006',
//       customerName: 'example',
//       customerPhone: '+7 999 999 99 99',
//       customerEmail: 'example@example.example',
//       intakePoint: '',
//       delivery: '',
//       intakeDate: 2026-04-02T05:37:26.307Z,
//       approveNeeded: false,
//       orderStatus: 'ACCEPTED',
//       orderNumber: 'ZO66-20260402-0006',
//       currency: 'RUB',
//       includedInInvoice: false,
//       invoiceId: null,
//       invoiceName: null,
//       invoicePublicationHtmlUrl: null,
//       customerId: 'cmngzmrga0000z53ljqhrx66a',
//       managerId: null,
//       createdAt: 2026-04-02T05:37:26.308Z,
//       updatedAt: 2026-04-02T05:37:29.370Z,
//       items: {
//         id: 'cmnh1m8vd00035b3loj5xmejj',
//           orderId: 'cmnh1m8tg00025b3l8fqpmf4q',
//           templateId: 1,
//           sizeId: 12,
//           holePattern: 'TWO_HORIZONTAL',
//           frameId: 2,
//           backgroundId: 5,
//           finish: null,
//           comment: null,
//           discussComment: null,
//           approveNeeded: false,
//           retouchNeeded: false,
//           approvalStage: 'NOT_STARTED',
//           approved: false,
//           skuCode: '20004',
//           goldType: null,
//           templateCode: 'F1',
//           templateLabel: 'Ф1',
//           templateFullTitle: 'Вертикальный овал Ф1',
//           dateOfBirth: null,
//           dateOfDeath: null,
//           firstName: '',
//           middleName: '',
//           lastName: '',
//           dateOfBirthSecondPerson: null,
//           dateOfDeathSecondPerson: null,
//           firstNameSecondPerson: '',
//           middleNameSecondPerson: '',
//           lastNameSecondPerson: '',
//           managerActionNeeded: null,
//           userActionNeeded: false,
//           createdAt: 2026-04-02T05:37:26.376Z,
//           updatedAt: 2026-04-02T05:37:26.376Z,
//           assets: [],
//           size: { id: 12, widthCm: 9, heightCm: 12, label: '9×12', priceMinor: 0 },
//         frame: { id: 2, code: 1, name: 'Рамка 1' }
//       },
//     customer: {
//         id: 'cmngzmrga0000z53ljqhrx66a',
//           email: 'example@example.example',
//           passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$zeMZS8x0HdRul55WUzzrlw$+vaFtzWbdaSC41gPNKQPblYZQ6GqI6NoAIG9XO21s2U',
//           name: 'example',
//           phone: '+7 999 999 99 99',
//           legalName: 'ООО "СКЗ ГРАНИТ МАСТЕР"',
//           address: 'Респ Башкортостан, г Салават, ул Индустриальная, зд 15',
//           inn: '0266066578',
//           kontragentId: '4b2204a7-2e4e-11f1-0a80-1353000b4c55',
//           role: 'CUSTOMER',
//           createdAt: 2026-04-02T04:41:51.225Z,
//           updatedAt: 2026-04-02T04:42:02.939Z,
//           notifyChannel: null,
//           telegramChatId: null
//       }
//   }
