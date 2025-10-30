import { IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';
export class ChangeOrderStatusDto {
  @IsString()
  status: OrderStatus;
}
