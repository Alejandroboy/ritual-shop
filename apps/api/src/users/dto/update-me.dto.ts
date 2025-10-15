import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string | null;
}
