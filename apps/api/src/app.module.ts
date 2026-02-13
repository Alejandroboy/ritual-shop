import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { ConfigurationModule } from './config/configuration.module';
import { HealthModule } from './health/health.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerService } from './common/mailer.service';
import { AdminAuthModule } from './admin/admin-auth/admin-auth.module';
import { AdminOrdersModule } from './admin/admin-orders/admin-orders.module';
import { AdminTemplatesModule } from './admin/admin-templates/admin-templates.module';
import { AdminStatsModule } from './admin/admin-stats/admin-stats.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminUsersModule } from './admin/admin-users/admin-users.module';
import { S3Module } from './s3/s3.module';
import { AssetsModule } from './assets/assets.module';
import { TelegramModule } from './notifications/telegram/telegram.module';
import { OrdersItemsModule } from './orders/orders-items/orders-items.module';
import { DaDataModule } from './integrations/da-data/da-data.module';
import { MoySkladModule } from './integrations/moy-sklad/moy-sklad.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    OrdersItemsModule,
    DaDataModule,
    MoySkladModule,
    SyncModule,
    S3Module,
    AssetsModule,
    AdminUsersModule,
    AdminAuthModule,
    AuthModule,
    UsersModule,
    AdminOrdersModule,
    AdminTemplatesModule,
    AdminStatsModule,
    CatalogModule,
    ConfigurationModule,
    EmailModule,
    HealthModule,
    OrdersModule,
    PrismaModule,
    TelegramModule,
  ],
  providers: [MailerService],
})
export class AppModule {}
