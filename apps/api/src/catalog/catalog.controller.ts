import {
  Controller,
  Get,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ListTemplatesQuery } from './dto/list-templates.dto';
import { GetTemplateDto } from './dto/get-template.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('templates')
  list(@Query() q: ListTemplatesQuery) {
    return this.catalogService.listTemplates(q);
  }
  @Get('templates/:code')
  getTemplate(@Param() params: GetTemplateDto) {
    const code = params.code.trim();
    if (!code || code === 'undefined' || code === 'null') {
      throw new BadRequestException('Template code is required');
    }
    return this.catalogService.getTemplate(code);
  }

  @Get('dictionaries')
  dictionaries() {
    return this.catalogService.getDictionaries();
  }

  @Get('enums')
  enums() {
    return this.catalogService.getEnums();
  }

  @Get('ping')
  ping() {
    return { ok: true };
  }
}
