const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const SEED_VERSION = 1; // повышайте при изменениях справочников

async function withLock(fn) {
  // эксклюзивный лок на время сида
  await prisma.$executeRawUnsafe('SELECT pg_advisory_lock(873654321)');
  try {
    return await fn();
  } finally {
    await prisma.$executeRawUnsafe('SELECT pg_advisory_unlock(873654321)');
  }
}

async function ensureSeedStateTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SeedState" (
      id INT PRIMARY KEY DEFAULT 1,
      version INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await prisma.$executeRawUnsafe(`
    INSERT INTO "SeedState"(id, version) VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING
  `);
}

async function getVersion() {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT version FROM "SeedState" WHERE id=1`,
  );
  return rows.length ? Number(rows[0].version) : 0;
}

async function setVersion(v) {
  await prisma.$executeRawUnsafe(
    `UPDATE "SeedState" SET version=$1, updated_at=now() WHERE id=1`,
    v,
  );
}

// ваши справочники/шаблоны — только UPSERT'ы!
async function seedV1() {
  // примеры (замените на реальные поля вашей схемы)
  await prisma.template.upsert({
    where: { code: 'WCG-TF-R-H-BW' },
    update: {},
    create: { code: 'WCG-TF-R-H-BW', title: 'Demo template' },
  });
  // TODO: sizes, frames, backgrounds, finishes — аналогично upsert
}

async function main() {
  if (process.env.SEED_ENABLED !== 'true') {
    console.log('[seed] disabled, skip');
    return;
  }
  await withLock(async () => {
    await ensureSeedStateTable();
    const current = await getVersion();
    if (current >= SEED_VERSION) {
      console.log(`[seed] already at v${current}, skip`);
      return;
    }
    console.log(`[seed] upgrading ${current} -> ${SEED_VERSION}`);
    await seedV1();
    await setVersion(SEED_VERSION);
    console.log('[seed] done');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
