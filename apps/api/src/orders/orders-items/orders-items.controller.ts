import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { OrdersItemsService } from './orders-items.service';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ApproveDto } from '../dto/approve.dto';

@Controller('admin/orders/:id/items')
export class OrdersItemsAdminController {
  constructor(private readonly ordersItemsService: OrdersItemsService) {}

  @Get(':itemId')
  get(@Param('itemId') itemId: string, @Param('id') id: string) {
    return this.ordersItemsService.getById(id, itemId);
  }

  @Get(':itemId/approve')
  approve(
    @Param('itemId') itemId: string,
    @Param('id') id: string,
    dto: ApproveDto,
  ) {
    return this.ordersItemsService.updateApproval(id, itemId, dto);
  }
}

@Controller('orders/:id/items')
export class OrdersItemsController {
  constructor(private readonly ordersItemsService: OrdersItemsService) {}

  @Get(':itemId')
  get(@Param('itemId') itemId: string, @Param('id') id: string) {
    return this.ordersItemsService.getById(id, itemId);
  }

  @Patch(':itemId/approve')
  approve(
    @Param('itemId') itemId: string,
    @Param('id') id: string,
    @Body() dto: ApproveDto,
  ) {
    return this.ordersItemsService.updateApproval(id, itemId, dto);
  }

  @Patch(':itemId/discus')
  discus(
    @Param('itemId') itemId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.ordersItemsService.updateComment(id, itemId, dto.text);
  }
}
