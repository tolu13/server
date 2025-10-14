/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production seed...');

  // ====== 1. ASSETS ======
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'USDT', name: 'Tether USD' },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { symbol: asset.symbol },
      update: {},
      create: asset,
    });
  }
  console.log('✅ Assets seeded');

  // ====== 2. TRADING PAIRS ======
  const btc = await prisma.asset.findUnique({ where: { symbol: 'BTC' } });
  const eth = await prisma.asset.findUnique({ where: { symbol: 'ETH' } });
  const ada = await prisma.asset.findUnique({ where: { symbol: 'ADA' } });
  const usdt = await prisma.asset.findUnique({ where: { symbol: 'USDT' } });

  if (!btc || !eth || !ada || !usdt) throw new Error('❌ Missing base assets');

  const tradingPairs = [
    { symbol: 'BTC/USDT', baseAssetId: btc.id, quoteAssetId: usdt.id },
    { symbol: 'ETH/USDT', baseAssetId: eth.id, quoteAssetId: usdt.id },
    { symbol: 'ADA/USDT', baseAssetId: ada.id, quoteAssetId: usdt.id },
  ];

  for (const pair of tradingPairs) {
    await prisma.tradingPair.upsert({
      where: { symbol: pair.symbol },
      update: {},
      create: pair,
    });
  }
  console.log('✅ Trading pairs seeded');

  // ====== 3. USERS ======
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const traderPassword = await bcrypt.hash('Trader@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexatrade.com' },
    update: {},
    create: {
      email: 'admin@nexatrade.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const trader = await prisma.user.upsert({
    where: { email: 'demo@trader.com' },
    update: {},
    create: {
      email: 'demo@trader.com',
      password: traderPassword,
      role: Role.TRADER,
    },
  });
  console.log('✅ Users seeded');

  // ====== 4. WALLETS ======
  const allAssets = await prisma.asset.findMany();

  for (const user of [admin, trader]) {
    for (const asset of allAssets) {
      const initialBalance =
        user.role === Role.ADMIN
          ? 100000 // admin has a big balance
          : asset.symbol === 'ADA'
            ? 100 // trader starts with 100 ADA
            : 5000; // 5k USDT, etc.

      await prisma.wallet.upsert({
        where: { userId_assetId: { userId: user.id, assetId: asset.id } },
        update: { balance: initialBalance, available: initialBalance },
        create: {
          userId: user.id,
          assetId: asset.id,
          balance: initialBalance,
          available: initialBalance,
        },
      });
    }
  }
  console.log('✅ Wallets seeded');

  console.log('🌟 Production seed completed successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// npx ts-node prisma/seed.prod.ts
