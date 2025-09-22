import { Order, Trade } from './entities/order';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class OrderBook {
  private buyOrders: Order[] = [];
  private sellOrders: Order[] = [];
  private lastPrice: number; // store last or initial price for this pair
  private readonly _pairId: string;

  constructor(pairId: string, initialPrice: number) {
    this._pairId = pairId;
    this.lastPrice = initialPrice;
  }

  public get pairId(): string {
    return this._pairId;
  }

  public getMarketPrice(): number {
    // If there are no trades yet, return the last known price
    if (!this.lastPrice) {
      return 0;
    }

    // If there are open orders, use the mid price
    if (this.buyOrders.length > 0 && this.sellOrders.length > 0) {
      const bestBid = this.buyOrders[0].price;
      const bestAsk = this.sellOrders[0].price;
      return (bestBid + bestAsk) / 2;
    }

    return this.lastPrice;
  }

  private updateLastPrice(price: number) {
    this.lastPrice = price;
  }

  async addOrder(order: Order): Promise<void> {
    // Save order to DB
    await prisma.order.create({ data: order });

    if (order.type === 'MARKET') {
      if (order.side === 'BUY') {
        const trades = await this.matchMarketBuy(order);
        if (trades.length > 0)
          this.updateLastPrice(trades[trades.length - 1].price);
      } else {
        const trades = await this.matchMarketSell(order);
        if (trades.length > 0)
          this.updateLastPrice(trades[trades.length - 1].price);
      }
    }

    if (order.side === 'BUY') {
      this.buyOrders.push(order);
      this.buyOrders.sort(
        (a, b) =>
          b.price - a.price || a.timestamp.getTime() - b.timestamp.getTime(),
      );
    } else {
      this.sellOrders.push(order);
      this.sellOrders.sort(
        (a, b) =>
          a.price - b.price || a.timestamp.getTime() - b.timestamp.getTime(),
      );
    }
  }

  // ... your existing matchMarketBuy, matchMarketSell unchanged but calls to updateLastPrice after trades

  private async matchMarketBuy(order: Order): Promise<Trade[]> {
    const trades: Trade[] = [];
    let quantityToFill = order.quantity;

    while (quantityToFill > 0 && this.sellOrders.length > 0) {
      const sellOrder = this.sellOrders[0];
      const tradeQuantity = Math.min(quantityToFill, sellOrder.quantity);
      const trade: Trade = {
        buyOrderId: order.id,
        sellOrderId: sellOrder.id,
        price: sellOrder.price,
        quantity: tradeQuantity,
        timestamp: new Date(),
        buyerId: order.userId,
        sellerId: sellOrder.userId,
        pairId: order.pairId,
      };

      await prisma.trade.create({ data: trade });
      trades.push(trade);

      sellOrder.quantity -= tradeQuantity;
      quantityToFill -= tradeQuantity;

      await prisma.order.update({
        where: { id: sellOrder.id },
        data: {
          quantity: sellOrder.quantity,
          status: sellOrder.quantity === 0 ? 'FILLED' : 'PARTIALLY_FILLED',
        },
      });

      if (sellOrder.quantity === 0) this.sellOrders.shift();
    }

    return trades;
  }

  private async matchMarketSell(order: Order): Promise<Trade[]> {
    const trades: Trade[] = [];
    let quantityToFill = order.quantity;

    while (quantityToFill > 0 && this.buyOrders.length > 0) {
      const buyOrder = this.buyOrders[0];
      const tradeQuantity = Math.min(quantityToFill, buyOrder.quantity);
      const trade: Trade = {
        buyOrderId: buyOrder.id,
        sellOrderId: order.id,
        price: buyOrder.price,
        quantity: tradeQuantity,
        timestamp: new Date(),
        buyerId: buyOrder.userId,
        sellerId: order.userId,
        pairId: order.pairId,
      };

      await prisma.trade.create({ data: trade });
      trades.push(trade);

      buyOrder.quantity -= tradeQuantity;
      quantityToFill -= tradeQuantity;

      await prisma.order.update({
        where: { id: buyOrder.id },
        data: {
          quantity: buyOrder.quantity,
          status: buyOrder.quantity === 0 ? 'FILLED' : 'PARTIALLY_FILLED',
        },
      });

      if (buyOrder.quantity === 0) this.buyOrders.shift();
    }

    return trades;
  }

  async matchOrders(): Promise<Trade[]> {
    const trades: Trade[] = [];

    while (this.buyOrders.length > 0 && this.sellOrders.length > 0) {
      const buyOrder = this.buyOrders[0];
      const sellOrder = this.sellOrders[0];

      if (buyOrder.price >= sellOrder.price) {
        const tradeQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);
        const tradePrice = sellOrder.price;

        const trade: Trade = {
          buyOrderId: buyOrder.id,
          sellOrderId: sellOrder.id,
          price: tradePrice,
          quantity: tradeQuantity,
          timestamp: new Date(),
          buyerId: buyOrder.userId, // Add this field
          sellerId: sellOrder.userId, // Add this field
          pairId: buyOrder.pairId,
        };

        this.lastPrice = trade.price;
        trades.push(trade);

        // Save trade to DB
        await prisma.trade.create({ data: trade });

        // Update quantities in memory
        buyOrder.quantity -= tradeQuantity;
        sellOrder.quantity -= tradeQuantity;

        // Update orders in DB
        await prisma.order.update({
          where: { id: buyOrder.id },
          data: {
            quantity: buyOrder.quantity,
            status: buyOrder.quantity === 0 ? 'FILLED' : 'PARTIALLY_FILLED',
          },
        });

        await prisma.order.update({
          where: { id: sellOrder.id },
          data: {
            quantity: sellOrder.quantity,
            status: sellOrder.quantity === 0 ? 'FILLED' : 'PARTIALLY_FILLED',
          },
        });

        if (buyOrder.quantity === 0) this.buyOrders.shift();
        if (sellOrder.quantity === 0) this.sellOrders.shift();
      } else {
        break;
      }
    }

    return trades;
  }

  getOrderBook(): {
    buyOrders: Order[];
    sellOrders: Order[];
    lastPrice: number;
  } {
    return {
      buyOrders: this.buyOrders,
      sellOrders: this.sellOrders,
      lastPrice: this.lastPrice, // include last price here
    };
  }
}

export default OrderBook;
