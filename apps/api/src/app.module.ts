import { join, resolve } from 'path';
import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { ConfigurationModule } from './config/configuration.module';
import { HealthModule } from './health/health.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { MailerService } from './common/mailer.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AdminAuthModule } from './admin/admin-auth/admin-auth.module';
import { AdminOrdersModule } from './admin/admin-orders/admin-orders.module';
import { AdminTemplatesModule } from './admin/admin-templates/admin-templates.module';
import { AdminStatsModule } from './admin/admin-stats/admin-stats.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminUsersModule } from './admin/admin-users/admin-users.module';
import { S3Module } from './s3/s3.module';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [
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
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOADS_DIR
        ? resolve(process.env.UPLOADS_DIR)
        : join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    OrderItemsModule,
  ],
  providers: [MailerService],
})
export class AppModule {}
