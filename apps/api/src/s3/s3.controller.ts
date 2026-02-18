import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { S3Service } from './s3.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('uploads')
export class S3Controller {
  constructor(
    private readonly s3: S3Service,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('presign')
  async presign(
    @Body()
    b: {
      orderId: string;
      itemId?: string;
      filename: string;
      contentType?: string;
    },
  ) {
    const order = await this.prismaService.order.findUniqueOrThrow({
      where: { id: b.orderId },
      select: { orderNumber: true, createdAt: true },
    });
    console.log('order', order);

    const key = this.s3.makeKey({
      orderNumber: order.orderNumber!, // раз ты генеришь на createOrder
      createdAt: order.createdAt,
      filename: b.filename,
      itemId: b.itemId,
    });

    return this.s3.presignPut(key, b.contentType || undefined);
  }

  @Get('signed-get')
  async signedGet(
    @Query('key') key: string,
    @Query('filename') filename?: string,
    @Query('download') download?: string,
    @Query('contentType') contentType?: string,
  ) {
    const dl = download === '1' || download === 'true';
    return this.s3.presignGet(key, { filename, download: dl, contentType });
  }
}
