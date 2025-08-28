import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigurationService } from '../config/configuration.service';

@Controller('email')
export class EmailController {
  constructor(
    private readonly svc: EmailService,
    private readonly configurationService: ConfigurationService,
  ) {}
  @Get('test')
  async test(@Query('to') to?: string) {
    const info = await this.svc.sendTest(to);
    return { messageId: info.messageId };
  }

  @Get('env')
  env() {
    return {
      host: this.configurationService.get('SMTP_HOST'),
      port: this.configurationService.get('SMTP_PORT'),
      secure: this.configurationService.get('SMTP_SECURE'),
    };
  }
}
