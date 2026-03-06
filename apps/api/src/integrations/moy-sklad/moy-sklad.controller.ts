import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MoySkladService } from './moy-sklad.service';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GetByInnDto {
  @IsString() inn!: string;
}

class GetMetaBySkuDto {
  @IsString() sku!: string;
}

class InvoiceOutPositionDto {
  @IsString()
  sku!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  qty?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceMinor?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  label?: string;
}

class CreateInvoiceOutDto {
  @IsString()
  counterpartyId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceOutPositionDto)
  positions!: InvoiceOutPositionDto[];

  @IsOptional()
  @IsString()
  invoiceDescription?: string;
}

@Controller('moy-sklad')
export class MoySkladController {
  constructor(private readonly moySkladService: MoySkladService) {}

  @Get(':inn')
  getByInn(@Param() params: GetByInnDto) {
    return this.moySkladService.findCounterpartyIdByInn(params.inn);
  }

  @Get('sku/:sku')
  getMetaBySku(@Param() params: GetMetaBySkuDto) {
    return this.moySkladService.resolveAssortmentMetaBySku(params.sku);
  }

  @Post('invoiceout')
  createInvoiceOut(@Body() body: CreateInvoiceOutDto) {
    return this.moySkladService.createInvoiceOut({
      counterpartyId: body.counterpartyId,
      orderIds: body.orderIds,
      positions: body.positions,
      invoiceDescription: body.invoiceDescription,
    });
  }

  @Get('orders/:orderId/invoice-publication-url')
  async getPublicationUrl(
    @Param('orderId') orderId: string,
    @Query('templateId') templateId: string,
  ) {
    const url =
      await this.moySkladService.getOrCreateOrderInvoicePublicationHtmlUrl(
        orderId,
        templateId,
      );
    return { url };
  }

  @Post(':id/sync-moysklad-prices')
  async syncPrices(@Param('id') id: string) {
    const templateId = Number(id);
    return this.moySkladService.syncTemplatePricesFromMoysklad({
      templateId,
      concurrency: 6,
    });
  }

  @Post('sync-templates-prices')
  async syncAll(
    @Body() body?: { stopOnError?: boolean; templateConcurrency?: number },
  ) {
    return this.moySkladService.syncAllTemplatesPricesFromMoysklad({
      stopOnError: body?.stopOnError ?? false,
      templateConcurrency: body?.templateConcurrency ?? 6,
    });
  }
}
