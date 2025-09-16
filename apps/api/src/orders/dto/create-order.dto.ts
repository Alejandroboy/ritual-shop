import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  intakePoint?: string;

  @IsOptional()
  @IsString()
  delivery?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  intakeDate?: Date;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  approveNeeded?: boolean;
}
