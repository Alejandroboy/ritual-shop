import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';
import { ConfigurationModule } from './config/configuration.module';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { CatalogModule } from './catalog/catalog.module';
import { CatalogController } from './catalog/catalog.controller';
import { CatalogService } from './catalog/catalog.service';
import { PrismaService } from './prisma/prisma.service';
import { OrdersModule } from './orders/orders.module';
// import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { MailerService } from './common/mailer.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join, resolve } from 'path';
import { AdminAuthModule } from './admin/admin-auth/admin-auth.module';
import { AdminOrdersModule } from './admin/admin-orders/admin-orders.module';
import { AdminTemplatesModule } from './admin/admin-templates/admin-templates.module';
import { AdminStatsModule } from './admin/admin-stats/admin-stats.module';

@Module({
  imports: [
    // AdminModule,
    AdminAuthModule,
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
