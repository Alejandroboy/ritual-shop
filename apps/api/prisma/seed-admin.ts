import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'shepardhero@gmail.com';
  const password =
    process.env.PASSWORD ?? '6a3eb8a0-8983-4932-9eae-6c5d10acbee8';

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      name: 'Super Admin',
    },
  });

  console.log(`Admin seeded: ${email}`);
}

main().finally(() => prisma.$disconnect());
