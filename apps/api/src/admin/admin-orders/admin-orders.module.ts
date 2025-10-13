import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminGuard } from '../../common/admin.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '../../config/configuration.module';
import { ConfigurationService } from '../../config/configuration.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [
    AdminAuthModule,
    ConfigurationModule, // если ConfigModule.isGlobal=true — можно опустить
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (cfg: ConfigurationService) => ({
        secret: cfg.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AdminOrdersController],
  providers: [PrismaService, AdminGuard],
})
export class AdminOrdersModule {}
