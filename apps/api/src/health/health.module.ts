import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { ConfigurationModule } from '../config/configuration.module';

@Module({
  imports: [ConfigurationModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
