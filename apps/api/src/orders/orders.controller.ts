import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-item.dto';
import { AddAssetDto } from './dto/add-asset.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderItemDto } from './dto/update-item.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get('list')
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.ordersService.listOrders(
      Number(page) || 1,
      Number(pageSize) || 20,
    );
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }

  @Post(':id/items')
  addItem(@Param('id') orderId: string, @Body() dto: AddOrderItemDto) {
    return this.ordersService.addItem(orderId, dto);
  }

  @Post(':orderId/items/:itemId/assets')
  addAsset(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() dto: AddAssetDto,
  ) {
    return this.ordersService.addAsset(orderId, itemId, dto);
  }

  @Patch(':orderId')
  updateOrder(@Param('orderId') orderId: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.updateOrder(orderId, dto);
  }

  @Patch(':orderId/items/:itemId')
  updateItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateItem(orderId, itemId, dto);
  }

  @Patch(':orderId/items/:itemId/assets/:assetId')
  updateAsset(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Param('assetId') assetId: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.ordersService.updateAsset(orderId, itemId, assetId, dto);
  }

  @Delete(':orderId/items/:itemId/assets/:assetId')
  removeAsset(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.ordersService.removeAsset(orderId, itemId, assetId);
  }

  @Delete(':orderId/items/:itemId')
  removeItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.ordersService.removeItem(orderId, itemId);
  }

  @Post(':id/checkout')
  async checkout(@Param('id') id: string, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(id, dto);
  }
}
