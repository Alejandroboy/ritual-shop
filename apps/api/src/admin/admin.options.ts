import { Prisma } from '@prisma/client';
import type { AdminJSOptions } from 'adminjs';
import type { PrismaService } from '../prisma/prisma.service';
import { buildOrderActions } from './admin.actions';

const dm = (name: string) => {
  const m = Prisma.dmmf.datamodel.models.find((x) => x.name === name);
  if (!m) throw new Error(`Prisma model not found: ${name}`);
  return m;
};

function modelOf(name: string) {
  // @ts-ignore
  const map = (Prisma as any)?.dmmf?.modelMap;
  if (map?.[name]) return map[name];
  const m = Prisma.dmmf.datamodel.models.find((x) => x.name === name);
  if (!m) throw new Error(`Prisma model not found: ${name}`);
  return m;
}

export function getAdminOptions(prisma: PrismaService): AdminJSOptions {
  const orderActions = buildOrderActions(prisma);
  return {
    rootPath: '/admin',
    branding: { companyName: 'Ritual Shop Admin', withMadeWithLove: false },
    locale: {
      language: 'ru',
      translations: {
        ru: {
          labels: {
            Template: 'Шаблоны',
            Size: 'Размеры',
            Frame: 'Рамки',
            Background: 'Фоны',
            Order: 'Заказы',
            OrderItem: 'Позиции заказа',
            Asset: 'Файлы',
          },
          actions: {
            advanceStatus: 'Следующий статус',
          },
        },
      },
    },
    resources: [
      { resource: { model: modelOf('Template'), client: prisma } },
      {
        resource: { model: modelOf('Order'), client: prisma },
        options: {
          listProperties: [
            'id',
            'number',
            'orderStatus',
            'customerName',
            'createdAt',
          ],
          filterProperties: ['orderStatus', 'createdAt'],
          showProperties: [
            'id',
            'number',
            'orderStatus',
            'customerName',
            'customerPhone',
            'customerEmail',
            'createdAt',
            'updatedAt',
          ],
          id: 'Order',
          actions: orderActions,
        },
      },
      {
        resource: { model: modelOf('OrderItem'), client: prisma },
        options: {
          id: 'OrderItem',
          properties: {
            templateId: { reference: 'Template' },
            sizeId: { reference: 'Size' },
            frameId: { reference: 'Frame' },
            backgroundId: { reference: 'Background' },
          },
          listProperties: [
            'id',
            'orderId',
            'templateCode',
            'price',
            'createdAt',
          ],
          filterProperties: ['orderId', 'templateCode', 'createdAt'],
          showProperties: [
            'id',
            'orderId',
            'templateCode',
            'sizeId',
            'frameId',
            'backgroundId',
            'createdAt',
          ],
        },
      },
      { resource: { model: modelOf('Asset'), client: prisma } },
      { resource: { model: modelOf('Size'), client: prisma } },
      { resource: { model: modelOf('Frame'), client: prisma } },
      { resource: { model: modelOf('Background'), client: prisma } },
    ],
  };
}
