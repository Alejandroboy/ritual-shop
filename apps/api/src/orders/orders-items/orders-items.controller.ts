import { Controller, Get, Param } from '@nestjs/common';
import { OrdersItemsService } from './orders-items.service';

@Controller('admin/orders/:id/items')
export class OrdersItemsAdminController {
  constructor(private readonly ordersItemsService: OrdersItemsService) {}

  @Get(':itemId')
  get(@Param('itemId') itemId: string, @Param('id') id: string) {
    return this.ordersItemsService.getById(id, itemId);
  }

  @Get(':itemId/approve')
  approve(@Param('itemId') itemId: string, @Param('id') id: string) {
    return this.ordersItemsService.updateApproval(id, itemId);
  }
}

@Controller('orders/:id/items')
export class OrdersItemsController {
  constructor(private readonly ordersItemsService: OrdersItemsService) {}

  @Get(':itemId')
  get(@Param('itemId') itemId: string, @Param('id') id: string) {
    return this.ordersItemsService.getById(id, itemId);
  }

  @Get(':itemId/approve')
  approve(@Param('itemId') itemId: string, @Param('id') id: string) {
    return this.ordersItemsService.updateApproval(id, itemId);
  }
}
