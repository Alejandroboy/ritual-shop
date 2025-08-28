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

@Module({
  imports: [ConfigurationModule, EmailModule, HealthModule],
  controllers: [AppController, EmailController, HealthController],
  providers: [AppService, EmailService, HealthService],
})
export class AppModule {}
