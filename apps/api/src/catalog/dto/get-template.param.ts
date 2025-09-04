import { IsString } from 'class-validator';
export class GetTemplateParam {
  @IsString() code!: string;
}
