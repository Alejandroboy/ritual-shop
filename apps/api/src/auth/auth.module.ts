import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

import { PrismaService } from '../prisma/prisma.service';
import { ConfigurationService } from '../config/configuration.service';
import { ConfigurationModule } from '../config/configuration.module';

@Module({
  imports: [
    ConfigurationModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (cfg: ConfigurationService): JwtModuleOptions => ({
        secret: cfg.get('JWT_SECRET') || 'dev_secret_change_me',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, RefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
