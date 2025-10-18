import { Module } from '@nestjs/common';
import { AdminTemplatesController } from './admin-templates.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminGuard } from '../../common/admin.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '../../config/configuration.module';
import { ConfigurationService } from '../../config/configuration.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminTemplatesService } from './admin-templates.service';

@Module({
  imports: [
    AdminAuthModule,
    ConfigurationModule,
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (cfg: ConfigurationService) => ({
        secret: cfg.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AdminTemplatesController],
  providers: [AdminTemplatesService, PrismaService, AdminGuard],
  exports: [AdminTemplatesService],
})
export class AdminTemplatesModule {}
