import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) throw new Error('DATABASE_URL missing');

const pool = new pg.Pool({ connectionString: datasourceUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'shepardhero@gmail.com';
  const password =
    process.env.ADMIN_PASSWORD ?? '6a3eb8a0-8983-4932-9eae-6c5d10acbee8';

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: 'ADMIN_GOD',
      name: 'Alejandro',
    },
  });

  console.log(`Admin seeded: ${email}, role: ${'ADMIN_GOD'}`);
}

main().finally(() => prisma.$disconnect());
