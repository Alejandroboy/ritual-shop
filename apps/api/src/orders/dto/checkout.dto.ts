import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  userId: string;

  @IsString()
  phone: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}
