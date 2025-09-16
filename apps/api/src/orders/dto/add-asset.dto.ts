import { AssetKind } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AddAssetDto {
  @IsEnum(AssetKind)
  kind!: AssetKind;

  @IsString()
  filename!: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  primary?: boolean;

  @IsOptional()
  @MaxLength(500)
  note?: string;
}
