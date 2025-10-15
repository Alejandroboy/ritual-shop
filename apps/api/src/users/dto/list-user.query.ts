import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take: number = 20;
}
