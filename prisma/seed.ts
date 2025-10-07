import {
  PrismaClient,
  Role,
  OrderSide,
  OrderType,
  OrderStatus,
} from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NexaTrade database...');

  // --- USERS ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexatrade.io' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'admin@nexatrade.io',
      password: 'admin123', // 🔒 you can hash later
      role: Role.ADMIN,
    },
  });

  const trader = await prisma.user.upsert({
    where: { email: 'trader@nexatrade.io' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'trader@nexatrade.io',
      password: 'trader123',
      role: Role.TRADER,
    },
  });

  // --- ASSETS ---
  const btc = await prisma.asset.upsert({
    where: { symbol: 'BTC' },
    update: {},
    create: {
      id: randomUUID(),
      symbol: 'BTC',
      name: 'Bitcoin',
    },
  });

  const eth = await prisma.asset.upsert({
    where: { symbol: 'ETH' },
    update: {},
    create: {
      id: randomUUID(),
      symbol: 'ETH',
      name: 'Ethereum',
    },
  });

  const usdt = await prisma.asset.upsert({
    where: { symbol: 'USDT' },
    update: {},
    create: {
      id: randomUUID(),
      symbol: 'USDT',
      name: 'Tether USD',
    },
  });

  // --- TRADING PAIRS ---
  const btcUsdt = await prisma.tradingPair.upsert({
    where: { symbol: 'BTC/USDT' },
    update: {},
    create: {
      id: randomUUID(),
      baseAssetId: btc.id,
      quoteAssetId: usdt.id,
      symbol: 'BTC/USDT',
    },
  });

  const ethUsdt = await prisma.tradingPair.upsert({
    where: { symbol: 'ETH/USDT' },
    update: {},
    create: {
      id: randomUUID(),
      baseAssetId: eth.id,
      quoteAssetId: usdt.id,
      symbol: 'ETH/USDT',
    },
  });

  // --- WALLETS ---
  await prisma.wallet.createMany({
    data: [
      {
        id: randomUUID(),
        userId: trader.id,
        assetId: btc.id,
        balance: 0.5,
        available: 0.5,
        locked: 0,
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: trader.id,
        assetId: usdt.id,
        balance: 20000,
        available: 20000,
        locked: 0,
        updatedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  // --- SAMPLE ORDERS ---
  const order1 = await prisma.order.create({
    data: {
      id: randomUUID(),
      userId: trader.id,
      pairId: btcUsdt.id,
      type: OrderType.LIMIT,
      side: OrderSide.BUY,
      price: 65000,
      quantity: 0.1,
      status: OrderStatus.OPEN,
      updatedAt: new Date(),
    },
  });

  const order2 = await prisma.order.create({
    data: {
      id: randomUUID(),
      userId: trader.id,
      pairId: btcUsdt.id,
      type: OrderType.LIMIT,
      side: OrderSide.SELL,
      price: 67000,
      quantity: 0.1,
      status: OrderStatus.OPEN,
      updatedAt: new Date(),
    },
  });

  // --- SAMPLE TRADE ---

  await prisma.trade.create({
    data: {
      id: randomUUID(),
      buyOrderId: order1.id,
      sellOrderId: order2.id,
      buyerId: trader.id,
      sellerId: admin.id,
      price: 66000,
      quantity: 0.05,
      pairId: ethUsdt.id,
    },
  });

  console.log('✅ Database successfully seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
