import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '../../config/configuration.module';
import { ConfigurationService } from '../../config/configuration.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminGuard } from '../../common/admin.guard';

@Module({
  imports: [
    ConfigurationModule,
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: (configService: ConfigurationService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 900,
          // expiresIn: Number(configService.get('JWT_SECRET')) ?? 900,
        },
        // signOptions: {
        //   expiresIn: configService.get('JWT_EXPIRES') ?? '7d',
        // },
      }),
      inject: [ConfigurationService],
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminGuard],
  exports: [AdminAuthService, AdminGuard, JwtModule],
})
export class AdminAuthModule {}
