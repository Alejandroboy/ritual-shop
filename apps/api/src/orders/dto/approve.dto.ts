import { IsString } from 'class-validator';

export class ApproveDto {
  @IsString()
  userId!: string;
}
