import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { StorageType } from '@prisma/client';

export class AddAssetDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @MaxLength(500)
  note?: string;

  @IsString()
  storage: StorageType;

  @IsString()
  bucket: string;

  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  contentType: string;

  @IsNumber()
  size: number;

  @IsString()
  etag: string;

  @IsString()
  originalName: string;
}
