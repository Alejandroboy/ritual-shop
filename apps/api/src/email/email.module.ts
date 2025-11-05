import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigurationModule } from '../config/configuration.module';

@Module({
  imports: [ConfigurationModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
