import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get()
  async list(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.assets.list(orderId, itemId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CreateAssetDto,
  ) {
    return this.assets.createFromS3(orderId, itemId, dto);
  }

  @Delete(':assetId')
  async remove(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.assets.remove(orderId, itemId, assetId);
  }

  @Get(':id/url')
  async getUrl(@Param('id') id: string, @Query('download') dl?: '1') {
    return this.assets.getUrlById(id, dl);
  }
}
