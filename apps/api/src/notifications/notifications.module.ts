import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
// import { TelegramProvider } from './telegram.provider';
import { WhatsAppProvider } from './whatsapp.provider';

@Module({
  providers: [NotificationsService, WhatsAppProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
