import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import crypto from 'crypto';

function b64url(b: Buffer) {
  return b
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function sign(base: string, secret: string) {
  return b64url(crypto.createHmac('sha256', secret).update(base).digest());
}

@Controller('telegram')
export class TelegramLinkController {
  @Get('subscribe-link')
  getLink(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId required');

    const ts36 = Math.floor(Date.now() / 1000).toString(36);
    const base = `u:${userId}:${ts36}`;
    const sig = b64url(
      crypto
        .createHmac(
          'sha256',
          process.env.TELEGRAM_WEBHOOK_SECRET || 'no-secret',
        )
        .update(base)
        .digest()
        .subarray(0, 10),
    );

    const payload = `u${userId}-${ts36}-${sig}`;
    const url = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${payload}`;
    return { url };
  }
}
