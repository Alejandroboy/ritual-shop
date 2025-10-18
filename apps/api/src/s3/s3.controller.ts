import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { S3Service } from './s3.service';

@Controller('uploads')
export class S3Controller {
  constructor(private readonly s3: S3Service) {}

  @Post('presign')
  async presign(
    @Body()
    b: {
      orderId: string;
      itemId?: string;
      filename: string;
      contentType: string;
    },
  ) {
    const key = this.s3.makeKey(b.orderId, b.filename, b.itemId);
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
