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
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigurationModule, EmailModule, HealthModule, CatalogModule],
  controllers: [
    AppController,
    EmailController,
    HealthController,
    CatalogController,
  ],
  providers: [
    AppService,
    EmailService,
    HealthService,
    CatalogService,
    PrismaService,
  ],
})
export class AppModule {}
