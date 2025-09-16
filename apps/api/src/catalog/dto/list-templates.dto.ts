// import type {
//   Material,
//   Shape,
//   Orientation,
//   ColorMode,
//   Coverage,
// } from '@prisma/client';
//
// export type ListTemplatesQuery = Partial<{
//   material: Material;
//   shape: Shape;
//   orientation: Orientation;
//   colorMode: ColorMode;
//   coverage: Coverage;
// }>;

import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  Material,
  Shape,
  Orientation,
  ColorMode,
  Coverage,
} from '@prisma/client';

export class ListTemplatesQuery {
  @IsOptional() @IsEnum(Material) material?: Material;
  @IsOptional() @IsEnum(Shape) shape?: Shape;
  @IsOptional() @IsEnum(Orientation) orientation?: Orientation;
  @IsOptional() @IsEnum(ColorMode) colorMode?: ColorMode;
  @IsOptional() @IsEnum(Coverage) coverage?: Coverage;

  // пагинация
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  pageSize?: number;

  // сортировка (по умолчанию по коду)
  @IsOptional() @IsString() orderBy: 'code' | 'label' = 'code';
  @IsOptional() @IsString() order: 'asc' | 'desc' = 'asc';
}
