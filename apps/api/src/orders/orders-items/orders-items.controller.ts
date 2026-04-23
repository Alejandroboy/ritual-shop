import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersItemsService } from './orders-items.service';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { AddCommentDto } from '../dto/add-comment.dto';

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

  @Patch(':itemId/approve')
  approve(@Param('itemId') itemId: string, @Param('id') id: string) {
    return this.ordersItemsService.updateApproval(id, itemId);
  }

  @Patch(':itemId/discus')
  discus(
    @Param('itemId') itemId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.ordersItemsService.updateComment(id, itemId, dto.text);
  }

  @Post(':itemId/discus/add')
  addComments(
    @Param('itemId') itemId: string,
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
  ) {
    return this.ordersItemsService.addComment(
      id,
      itemId,
      dto.text,
      dto.userName,
      dto.userRole,
    );
  }
}
