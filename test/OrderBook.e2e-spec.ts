import OrderBook from '../src/orders/OrderBook'; // Adjust path as needed
import { Order } from '../src/orders/entities/order'; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from 'src/app.module';
import { Test, TestingModule } from '@nestjs/testing';

describe('OrderBook', () => {
  let orderBook: OrderBook;

  beforeEach(() => {
    orderBook = new OrderBook('some-pair-id', 100.0); // Provide pairId and initialPrice
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should add a new buy order', async () => {
    const order: Order = {
      id: uuidv4(),
      userId: uuidv4(), // Generate UUID for userId
      pairId: 'some-pair-id',
      type: 'LIMIT',
      side: 'BUY',
      price: 100.0,
      quantity: 1,
      status: 'OPEN',
      timestamp: new Date(),
    };

    await orderBook.addOrder(order);

    const { buyOrders } = orderBook.getOrderBook();

    expect(buyOrders.length).toBe(1);
    expect(buyOrders[0].userId).toBe(order.userId); // Check if the userId matches
    expect(buyOrders[0].price).toBe(order.price); // Check if the price matches
  });

  it('should match buy and sell orders', async () => {
    const buyOrder: Order = {
      id: uuidv4(),
      userId: uuidv4(),
      pairId: 'some-pair-id',
      type: 'LIMIT',
      side: 'BUY',
      price: 100.0,
      quantity: 1,
      status: 'OPEN',
      timestamp: new Date(),
    };

    const sellOrder: Order = {
      id: uuidv4(),
      userId: uuidv4(),
      pairId: 'some-pair-id',
      type: 'LIMIT',
      side: 'SELL',
      price: 100.0,
      quantity: 1,
      status: 'OPEN',
      timestamp: new Date(),
    };

    await orderBook.addOrder(buyOrder);
    await orderBook.addOrder(sellOrder);

    const trades = await orderBook.matchOrders();

    expect(trades.length).toBe(1); // There should be one trade
    expect(trades[0].buyOrderId).toBe(buyOrder.id);
    expect(trades[0].sellOrderId).toBe(sellOrder.id);
  });
});
