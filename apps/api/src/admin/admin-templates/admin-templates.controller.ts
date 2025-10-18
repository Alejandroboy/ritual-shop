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
} from '@nestjs/common';
import { Finish as FinishEnum, HolePattern as HoleEnum } from '@prisma/client';
import { AdminGuard } from '../../common/admin.guard';
import { AdminTemplatesService } from './admin-templates.service';

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
    @Query('finish') finish?: string, // MATTE/GLOSS
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
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.adminTemplatesService.updateTemplate(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.adminTemplatesService.deleteTemplate(id);
  }

  @Patch(':id/allowed')
  async updateAllowed(
    @Param('id') id: string,
    @Body()
    dto: {
      basePriceMinor?: number;
      sizeIds?: number[];
      frameIds?: number[];
      backgroundIds?: number[];
      finishes?: FinishEnum[];
      holePatterns?: HoleEnum[];
      sizeExtras?: Record<number, number>;
      frameExtras?: Record<number, number>;
      backgroundExtras?: Record<number, number>;
      finishExtras?: Partial<Record<FinishEnum, number>>;
      holeExtras?: Partial<Record<HoleEnum, number>>;
    },
  ) {
    return this.adminTemplatesService.updateAllowedTemplateFields(id, dto);
  }
}
