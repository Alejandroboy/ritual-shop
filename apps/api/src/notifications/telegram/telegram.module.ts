import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TelegramLinkController } from './telegram.link.controller';

@Module({
  controllers: [TelegramController, TelegramLinkController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
