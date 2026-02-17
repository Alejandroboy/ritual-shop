import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import crypto from 'crypto';

const log = new Logger('TelegramWebhook');

function b64url(buf: Buffer) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function hmac10(base: string, secret: string) {
  return b64url(
    crypto.createHmac('sha256', secret).update(base).digest().subarray(0, 10),
  );
}

@Controller('telegram')
export class TelegramController {
  constructor(private prisma: PrismaService) {}

  @HttpCode(200)
  @Post('webhook')
  async webhook(
    @Body() update: any,
    @Headers('x-telegram-bot-api-secret-token') secretHeader?: string,
  ) {
    if (
      process.env.TELEGRAM_WEBHOOK_SECRET &&
      secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET
    ) {
      throw new BadRequestException('Bad webhook secret');
    }

    const msg = update?.message;
    if (!msg) return { ok: true, reason: 'no_message' };

    const chatId = String(msg.chat.id);
    const text: string = (msg.text || '').trim();
    log.log(`IN: ${text}`);

    if (text.toLowerCase() === '/stop' || text.toLowerCase() === 'stop') {
      const res = await this.prisma.user.updateMany({
        where: { telegramChatId: chatId },
        data: {
          telegramChatId: null,
          notifyChannel: null,
        },
      });

      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: 'Вы отписаны.' }),
        },
      );

      log.log(`UNSUB users: ${res.count} (chatId=${chatId})`);
      return { ok: true, unsubscribed: res.count };
    }

    const m = text.match(/^\/start(?:\s+([A-Za-z0-9_-]{1,64}))?$/);
    if (!m) return { ok: true, reason: 'not_start' };

    const arg = m[1];
    if (!arg) {
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'Чтобы подключить уведомления, нажмите «Подписаться в Telegram» на сайте.',
          }),
        },
      );
      return { ok: true, reason: 'start_without_payload' };
    }

    let userId: string | null = null;

    const mNew = arg.match(/^u([A-Za-z0-9]+)-([A-Za-z0-9]+)-([A-Za-z0-9_-]+)$/);
    if (mNew) {
      const ts36 = mNew[2];
      const sig = mNew[3];
      userId = mNew[1];
      const base = `u:${userId}:${ts36}`;
      const must = hmac10(
        base,
        process.env.TELEGRAM_WEBHOOK_SECRET || 'no-secret',
      );
      if (sig !== must)
        throw new BadRequestException('Invalid payload signature');
    } else {
      const mOld = arg.match(
        /^user\.([A-Za-z0-9]+)\.([A-Za-z0-9]+)\.([A-Za-z0-9_-]+)$/,
      );
      if (mOld) {
        const base = `user.${mOld[1]}.${mOld[2]}`;
        const must = b64url(
          crypto
            .createHmac(
              'sha256',
              process.env.TELEGRAM_WEBHOOK_SECRET || 'no-secret',
            )
            .update(base)
            .digest(),
        );
        if (mOld[3] !== must)
          throw new BadRequestException('Invalid payload signature (legacy)');
        userId = mOld[1];
      } else {
        return { ok: true, reason: 'bad_payload' };
      }
    }

    const res = await this.prisma.user.update({
      where: { id: userId! },
      data: {
        notifyChannel: 'TELEGRAM',
        telegramChatId: chatId,
      },
    });

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'Подписка оформлена ✅',
        }),
      },
    );

    return { ok: true };
  }
}
