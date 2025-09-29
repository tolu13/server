import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import OrderBook from './OrderBook';
import { Order } from './entities/order';
import { CandlesService } from '../candles/candles.service';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  namespace: '/orderbook',
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export class OrderBookGateway {
  @WebSocketServer()
  server!: Server;

  private orderBooks: Map<string, OrderBook> = new Map();

  constructor(
    private candleService: CandlesService,
    private prisma: PrismaService,
  ) {
    void this.initOrderBooks();
    this.simulateMarketPrices(); // 🔥 Start simulation loop
  }

  private async initOrderBooks() {
    const pairs = await this.prisma.tradingPair.findMany();

    for (const pair of pairs) {
      const initialPrice = this.getInitialPrice(pair.symbol);
      const orderBook = new OrderBook(pair.id, initialPrice, pair.symbol);
      this.orderBooks.set(pair.id, orderBook);
    }
  }

  private getInitialPrice(symbol: string): number {
    const fallback = {
      'BTC/USDT': 112720.84,
      'ETH/USDT': 4182,
      'ADA/USDT': 0.8179,
    };

    return fallback[symbol.toUpperCase()] ?? 1;
  }

  // 🔹 Simulate live price movements
  private simulateMarketPrices() {
    setInterval(() => {
      this.orderBooks.forEach((orderBook, pairId) => {
        let price = orderBook.getMarketPrice();

        // Simulate small price fluctuation (-0.5% to +0.5%)
        const change = 1 + (Math.random() - 0.5) / 100;
        price = +(price * change).toFixed(2);

        // Update orderBook's internal market price
        orderBook.setMarketPrice(price);

        // Broadcast price update
        this.server.emit('marketPriceUpdate', {
          pairId,
          price,
          symbol: orderBook.getSymbol(),
        });
      });
    }, 3000); // every 3 seconds
  }

  // 🔹 Handle socket connections
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);

    const allOrderBooks = Array.from(this.orderBooks.entries()).map(
      ([pairId, orderBook]) => ({
        pairId,
        symbol: orderBook.getSymbol(),
        orderBook: orderBook.getOrderBook(),
        price: orderBook.getMarketPrice(),
      }),
    );
    client.emit('orderBookUpdate', allOrderBooks);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('placeOrder')
  async handlePlaceOrder(@MessageBody() order: Order) {
    console.log('Received placeOrder:', order);
    const orderBook = this.orderBooks.get(order.pairId);
    if (!orderBook)
      throw new Error(`OrderBook not found for pairId: ${order.pairId}`);

    await orderBook.addOrder(order);
    const trades = await orderBook.matchOrders();

    trades.forEach((trade) => {
      this.server.emit('tradeMatched', trade);
      this.server.emit('candlestickUpdate', { pairId: trade.pairId });
    });

    const currentOrderBook = this.orderBooks.get(order.pairId);
    if (!currentOrderBook)
      throw new Error(`OrderBook not found for pairId: ${order.pairId}`);

    const marketPrice = currentOrderBook.getMarketPrice();
    console.log('Market price update:', marketPrice);
    this.server.emit('marketPriceUpdate', {
      pairId: order.pairId,
      price: marketPrice,
    });

    Logger.debug('Order book update:', orderBook.getOrderBook());
    this.server.emit('orderBookUpdate', orderBook.getOrderBook());
  }

  @SubscribeMessage('getMarketPrice')
  handleGetMarketPrice(@MessageBody() pairId: string) {
    const orderBook = this.orderBooks.get(pairId);
    if (!orderBook)
      throw new Error(`OrderBook not found for pairId: ${pairId}`);

    return { price: orderBook.getMarketPrice(), pairId };
  }
}
