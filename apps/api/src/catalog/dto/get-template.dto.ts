import { IsString } from 'class-validator';
export class GetTemplateDto {
  @IsString() code!: string;
}
