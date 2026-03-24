import {
  IsArray,
  ArrayMinSize,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class BulkUpdateOrderStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[];

  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  userId?: string;
}
