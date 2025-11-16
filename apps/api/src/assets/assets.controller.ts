import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { IsString } from 'class-validator';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ListAssetsQuery } from './dto/list-assets.query';

export class CreateRetouchDto extends CreateAssetDto {
  @IsString() sourceAssetId!: string;
}

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
@Controller('orders/:orderId/items/:itemId/assets')
export class OrderItemAssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get()
  async list(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Query() query: ListAssetsQuery,
  ) {
    return this.assets.list(orderId, itemId, query);
  }

  @Post()
  async createOriginal(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CreateAssetDto,
  ) {
    return this.assets.createOriginalFromS3(orderId, itemId, dto);
  }

  @Post('retouch')
  async createRetouch(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CreateRetouchDto,
  ) {
    return this.assets.createRetouchFromS3(orderId, itemId, dto);
  }

  @Patch(':assetId/primary')
  @HttpCode(204)
  async makePrimary(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Param('assetId') assetId: string,
  ) {
    await this.assets.setPrimary(orderId, itemId, assetId);
  }

  @Delete(':assetId')
  async remove(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.assets.remove(orderId, itemId, assetId);
  }
}

@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get(':id/url')
  async getUrl(@Param('id') id: string, @Query('download') dl?: '1') {
    return this.assets.getUrlById(id, dl);
  }
}
