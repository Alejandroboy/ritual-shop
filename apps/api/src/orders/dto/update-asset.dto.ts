import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateAssetDto {
  @IsOptional() @IsString() filename?: string;
  @IsOptional() @IsUrl() url?: string;
  @IsOptional() @IsBoolean() primary?: boolean;
  @IsOptional() @IsString() note?: string;
}
