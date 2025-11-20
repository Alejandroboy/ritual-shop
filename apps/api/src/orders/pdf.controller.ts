import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';

@Controller('orders')
export class PdfController {
  constructor(private readonly orders: OrdersService) {}

  @Get(':id/blank.pdf')
  async downloadOrderBlank(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.orders.generateOrderPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="order-${id}.pdf"`,
    );
    res.send(pdfBuffer);
  }
}
