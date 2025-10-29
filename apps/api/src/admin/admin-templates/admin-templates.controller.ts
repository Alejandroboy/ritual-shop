import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminGuard } from '../../common/admin.guard';
import { AdminTemplatesService } from './admin-templates.service';
import { UpdateTemplateDto } from './update-template.dto';

@UseGuards(AdminGuard)
@Controller('admin/templates')
export class AdminTemplatesController {
  constructor(private adminTemplatesService: AdminTemplatesService) {}

  @Get('refs')
  async refs() {
    return this.adminTemplatesService.getRefs();
  }

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('sizeId') sizeId?: string,
    @Query('frameId') frameId?: string,
    @Query('backgroundId') backgroundId?: string,
    @Query('finish') finish?: string,
    @Query('page') page = '1',
  ) {
    return this.adminTemplatesService.getList(
      page,
      q,
      sizeId,
      frameId,
      backgroundId,
      finish,
    );
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    return this.adminTemplatesService.getById(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.adminTemplatesService.createTemplate(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: UpdateTemplateDto,
  ) {
    return this.adminTemplatesService.updateTemplate(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.adminTemplatesService.deleteTemplate(id);
  }
}
