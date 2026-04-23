import { IsOptional, IsString } from 'class-validator';

export class AddCommentDto {
  @IsString() text: string;
  @IsString() userName: string;

  @IsOptional()
  @IsString()
  userRole: string;
}
