import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  Min,
  IsObject,
} from 'class-validator';
import {
  Material,
  Shape,
  Orientation,
  ColorMode,
  Coverage,
} from '@prisma/client';

export class UpdateTemplateDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsEnum(Material) material?: Material;
  @IsOptional() @IsEnum(Shape) shape?: Shape;
  @IsOptional() @IsEnum(Orientation) orientation?: Orientation;
  @IsOptional() @IsEnum(ColorMode) colorMode?: ColorMode;
  @IsOptional() @IsEnum(Coverage) coverage?: Coverage;

  @IsOptional() @IsBoolean() supportsFrame?: boolean;
  @IsOptional() @IsBoolean() requiresBackground?: boolean;
  @IsOptional() @IsBoolean() requiresFinish?: boolean;
  @IsOptional() @IsBoolean() supportsHoles?: boolean;

  @IsOptional() @IsInt() @Min(0) personsMin?: number;
  @IsOptional() @IsInt() @Min(0) personsMax?: number;
  @IsOptional() @IsString() notes?: string;

  @IsOptional() @IsInt() @Min(0) perHolePrice?: number;

  @IsOptional() @IsObject() sizePrices?: Record<number, number>;
}
