import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CheckoutDto {
  @IsString()
  @MaxLength(120)
  fullName: string;

  @IsPhoneNumber('RU')
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MaxLength(120)
  city: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}
