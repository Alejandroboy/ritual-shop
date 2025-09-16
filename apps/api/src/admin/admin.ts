import type { INestApplication } from '@nestjs/common';
import session from 'express-session';
import type { SessionOptions } from 'express-session';
import { $Enums, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { BaseResource } from 'adminjs';
import { getAdminOptions } from './admin.options';

export async function setupAdmin(app: INestApplication) {
  const adminRoot = '/admin';

  const AdminJS = (await import('adminjs')).default;
  const AdminJSExpress = await import('@adminjs/express');
  const { Database, Resource } = await import('@adminjs/prisma');
  AdminJS.registerAdapter({ Database, Resource });

  const prisma = app.get(PrismaService);
  const options = getAdminOptions(prisma);
  const admin = new AdminJS(options);
  const orderRes = admin.findResource('Order');
  console.log(
    '[AdminJS] actions:',
    Object.keys(orderRes?.decorate?.().actions ?? {}),
  );
  const acts = orderRes?.decorate?.().actions ?? {};
  console.log('[AdminJS] Order actions:', Object.keys(acts));
  console.log('[AdminJS] advanceStatus.label =', acts?.advanceStatus);

  const decorator: any =
    (orderRes as any)?._decorated ?? (orderRes as any)?.decorate?.();

  // прочитаем enum значения из DMMF
  function readOrderStatusValues(): $Enums.OrderStatus[] {
    const client = require('@prisma/client') as any;
    const dmmf = client?.Prisma?.dmmf;
    const enums = dmmf?.schema?.enums ?? dmmf?.datamodel?.enums ?? [];
    const e = enums.find((x: any) => x?.name === 'OrderStatus');
    const values = (e?.values ?? []).map((v: any) =>
      typeof v === 'string' ? v : v?.name,
    );
    return values as $Enums.OrderStatus[];
  }
  const STATUS_VALUES = readOrderStatusValues();
  const FLOW: $Enums.OrderStatus[] =
    ((process.env.ADMIN_STATUS_FLOW || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((v) =>
        STATUS_VALUES.includes(v as $Enums.OrderStatus),
      ) as $Enums.OrderStatus[]) || STATUS_VALUES;

  function nextStatus(current: $Enums.OrderStatus): $Enums.OrderStatus {
    const i = Math.max(0, FLOW.indexOf(current));
    return FLOW[Math.min(i + 1, FLOW.length - 1)] || current;
  }

  // Диагностика — какие экшены реально висят
  const actionKeys = Object.keys(decorator?.actions ?? {});
  console.log('[AdminJS] Order actions registered:', actionKeys);
  // --- END: ensure custom actions are registered programmatically ---

  const ids = (admin.resources as unknown as BaseResource[]).map((r) => r.id());
  console.log('[AdminJS] Registered resources:', ids);

  const sessionDays = Number(process.env.ADMIN_SESSION_DAYS ?? 30);
  const sessionOptions: SessionOptions = {
    secret: process.env.ADMIN_COOKIE_SECRET ?? 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionDays * 24 * 60 * 60 * 1000,
    },
    name: 'ritual_admin',
  };

  app.use(admin.options.rootPath, session(sessionOptions) as any);

  // 5) Роутер с авторизацией
  const router = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (
        email: 'admin@example.com',
        password: '918575d3',
      ) => {
        console.log('[admin:login]', email);
        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { email };
        }
        return null;
      },
      cookieName: 'ritual_admin',
      cookiePassword: process.env.ADMIN_COOKIE_SECRET ?? 'dev_secret_change_me',
    },
    null,
    sessionOptions,
  );

  app.use(admin.options.rootPath, router);

  console.log(`[AdminJS] mounted at ${adminRoot}`);
}
