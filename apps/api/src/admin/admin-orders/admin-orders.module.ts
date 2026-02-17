import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminGuard } from '../../common/admin.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '../../config/configuration.module';
import { ConfigurationService } from '../../config/configuration.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminOrdersService } from './admin-orders.service';
import { EmailModule } from '../../email/email.module';
import { TelegramModule } from '../../notifications/telegram/telegram.module';
import { RemindersModule } from '../../reminders/reminders.module';

@Module({
  imports: [
    AdminAuthModule,
    ConfigurationModule,
    EmailModule,
    TelegramModule,
    RemindersModule,
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (cfg: ConfigurationService) => ({
        secret: cfg.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService, PrismaService, AdminGuard],
  exports: [AdminOrdersService],
})
export class AdminOrdersModule {}
