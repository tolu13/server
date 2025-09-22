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

@WebSocketGateway({ namespace: '/orderbook', cors: true })
export class OrderBookGateway {
  @WebSocketServer()
  server!: Server;

  private orderBooks: Map<string, OrderBook> = new Map();

  constructor(
    private candleService: CandlesService,
    private prisma: PrismaService,
  ) {
    void this.initOrderBooks();
  }
  private async initOrderBooks() {
    const pairs = await this.prisma.tradingPair.findMany();

    for (const pair of pairs) {
      const initialPrice = this.getInitialPrice(pair.symbol); // Default initial price if not set
      const orderBook = new OrderBook(pair.id, initialPrice);
      this.orderBooks.set(pair.id, orderBook);
    }
  }

  private getInitialPrice(symbol: string): number {
    const fallback = {
      'BTC/USDT': 30000,
      'ETH/USDT': 2000,
      'ADA/USDT': 0.6,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const price = fallback[symbol.toUpperCase()] ?? 1; // Use default value 1 if undefined
    return typeof price === 'number' ? price : 1;
  }

  //handle connect when client connects
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);

    const allOrderBooks = Array.from(this.orderBooks.entries()).map(
      ([pairId, orderBook]) => ({
        pairId,
        orderBook: orderBook.getOrderBook(),
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
    if (!orderBook) {
      throw new Error(`OrderBook not found for pairId: ${order.pairId}`);
    }

    await orderBook.addOrder(order);
    const trades = await orderBook.matchOrders();

    trades.forEach((trade) => {
      this.server.emit('tradeMatched', trade);
      this.server.emit('candlestickUpdate', { pairId: trade.pairId });
    });

    const currentOrderBook = this.orderBooks.get(order.pairId);
    if (!currentOrderBook) {
      throw new Error(`OrderBook not found for pairId: ${order.pairId}`);
    }

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
    if (!orderBook) {
      throw new Error(`OrderBook not found for pairId: ${pairId}`);
    }
    return {
      price: orderBook.getMarketPrice(),
      pairId: pairId,
    };
  }
}
// This code defines a WebSocket gateway for handling order book operations in a trading application.
