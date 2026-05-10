import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class UserOrdersQueryDto {
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsString() includedInInvoice?: string;
  @IsOptional() @IsString() invoiceStatus?: string;
  @IsOptional() @IsDateString() dateFrom?: string;
  @IsOptional() @IsDateString() dateTo?: string;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @Type(() => Number) page: number = 1;
  @IsOptional() @Type(() => Number) pageSize: number = 10;
}