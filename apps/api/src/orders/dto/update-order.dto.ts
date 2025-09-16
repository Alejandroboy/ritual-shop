import { IsBoolean, IsOptional, IsString, IsISO8601 } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional() @IsString() customerName?: string;
  @IsOptional() @IsString() customerPhone?: string;
  @IsOptional() @IsString() intakePoint?: string;
  @IsOptional() @IsString() delivery?: string;
  @IsOptional() @IsISO8601() intakeDate?: string; // ISO строка
  @IsOptional() @IsBoolean() approveNeeded?: boolean;
}
