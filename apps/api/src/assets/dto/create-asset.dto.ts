import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAssetDto {
  @IsIn(['s3'])
  storage!: 's3';

  @IsString()
  @IsNotEmpty()
  bucket!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsOptional()
  contentType?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  size?: number | null;

  @IsString()
  @IsOptional()
  etag?: string | null;

  @IsString()
  @IsOptional()
  originalName?: string | null;
}
