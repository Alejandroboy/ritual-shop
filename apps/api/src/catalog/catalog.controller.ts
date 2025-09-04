import { Controller, Get, Query, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import type { ListTemplatesQuery } from './dto/list-templates.dto';
import type { GetTemplateParam } from './dto/get-template.param';

@Controller('catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('templates')
  list(@Query() q: ListTemplatesQuery) {
    return this.catalogService.listTemplates(q);
  }
  @Get('templates/:code')
  getTemplate(@Param() { code }: GetTemplateParam) {
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
