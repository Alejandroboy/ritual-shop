import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import { OrderItemsService } from './order-items.service';
import { mkdir } from 'fs/promises';

function assertCuid(id: string, label: string) {
  console.log('assertCuid', id);
  if (!/^c[a-z0-9]{8,}$/i.test(id))
    throw new BadRequestException(`${label} is invalid`);
}

function uploadsRoot() {
  return process.env.UPLOADS_DIR
    ? resolve(process.env.UPLOADS_DIR)
    : join(process.cwd(), 'uploads');
}

@Controller('order-items/:orderId/items')
export class OrderItemsController {
  constructor(private readonly service: OrderItemsService) {}
  @Post(':itemId/assets')
  @UseInterceptors(
    FilesInterceptor('files', 8, {
      storage: diskStorage({
        destination: async (_req, _file, cb) => {
          try {
            const root = uploadsRoot();
            const { orderId, itemId } = _req.params;
            assertCuid(orderId, 'orderId');
            assertCuid(itemId, 'itemId');

            const dest = join(root, 'orders', orderId, itemId);
            await mkdir(dest, { recursive: true });
            cb(null, dest);
          } catch (e) {
            cb(e as any, '');
          }
        },
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        const ok = [
          'image/png',
          'image/jpeg',
          'image/webp',
          'application/pdf',
        ].includes(file.mimetype);
        cb(null, ok);
      },
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  async uploadAssets(
    @Param('itemId') itemId: string,
    @Param('orderId') orderId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('uploadAssets', itemId, orderId);
    if (!itemId) throw new BadRequestException('Invalid item id');
    return this.service.attachAssetsToItem(itemId, orderId, files);
  }
}
