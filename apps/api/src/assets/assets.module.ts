import { Module } from '@nestjs/common';
import {
  AssetsController,
  OrderItemAssetsController,
} from './assets.controller';
import { AssetsService } from './assets.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Module } from '../s3/s3.module';
import { AdminGuard } from '../common/admin.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '../config/configuration.module';
import { ConfigurationService } from '../config/configuration.service';
import { AdminAuthModule } from '../admin/admin-auth/admin-auth.module';
import { OrdersItemsModule } from '../orders/orders-items/orders-items.module';

@Module({
  controllers: [AssetsController, OrderItemAssetsController],
  providers: [AssetsService, PrismaService, AdminGuard],
  exports: [AssetsService],
  imports: [
    AdminAuthModule,
    OrdersItemsModule,
    S3Module,
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (cfg: ConfigurationService) => ({
        secret: cfg.get('JWT_SECRET'),
      }),
    }),
  ],
})
export class AssetsModule {}
