import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ConfigurationModule } from '../config/configuration.module';

@Module({
  imports: [ConfigurationModule],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
