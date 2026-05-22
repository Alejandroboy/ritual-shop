import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class AdminOrdersQueryDto {
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;

  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() userEmail?: string;
  @IsOptional() @IsString() userNameContains?: string;
  @IsOptional() @IsString() orderNumber?: string;
  @IsOptional() @IsString() includedInInvoice?: string;
  @IsOptional() @IsString() invoiceStatus?: string;

  @IsOptional() @IsDateString() dateFrom?: string;
  @IsOptional() @IsDateString() dateTo?: string;

  @IsOptional() @IsString() q?: string;

  @IsOptional() @Type(() => Number) page: number = 1;
  @IsOptional() @Type(() => Number) pageSize: number = 25;
}
