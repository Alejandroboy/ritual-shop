import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { ConfigurationModule } from '../../config/configuration.module';
import { ConfigurationService } from '../../config/configuration.service';
import { AdminGuard } from '../../common/admin.guard';

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
  controllers: [AdminUsersController],
  providers: [UsersService, PrismaService, AdminGuard],
})
export class AdminUsersModule {}
