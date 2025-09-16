import { AssetKind, Finish, HolePattern } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AddOrderItemDto {
  @IsString()
  templateCode!: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  sizeId?: number;

  @IsOptional()
  @IsEnum(HolePattern)
  holePattern?: HolePattern;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  frameId?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  backgroundId?: number;

  @IsOptional()
  @IsEnum(Finish)
  finish?: Finish;

  @IsOptional()
  @MaxLength(500)
  comment?: string;
}
