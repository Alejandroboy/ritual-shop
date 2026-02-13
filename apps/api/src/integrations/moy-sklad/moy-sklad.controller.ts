import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
    });
  }
}
