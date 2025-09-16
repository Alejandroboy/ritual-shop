import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Finish, HolePattern } from '@prisma/client';

export class UpdateOrderItemDto {
  @IsOptional() @IsString() templateCode?: string;

  @IsOptional() @IsInt() @Min(1) sizeId?: number;
  @IsOptional() @IsEnum(HolePattern) holePattern?: HolePattern;
  @IsOptional() @IsInt() @Min(1) frameId?: number;
  @IsOptional() @IsInt() @Min(1) backgroundId?: number;
  @IsOptional() @IsEnum(Finish) finish?: Finish;
  @IsOptional() @IsString() comment?: string;
}
