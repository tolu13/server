import { Injectable } from '@nestjs/common';
import { Trade } from 'src/orders/entities/order';

interface Candle {
  time: number; // e.g. Date.getTime() rounded to minute
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
@Injectable()
export class CandlesService {
  private candles: Record<string, Candle[]> = {}; // key: pairId

  addTrade(trade: Trade) {
    const bucketTime = Math.floor(trade.timestamp.getTime() / 60000) * 60000; // 1-min bucket
    const pairCandles = this.candles[trade.pairId] || [];

    const lastCandle = pairCandles[pairCandles.length - 1];

    if (!lastCandle || lastCandle.time !== bucketTime) {
      // Start a new candle
      const newCandle: Candle = {
        time: bucketTime,
        open: trade.price,
        high: trade.price,
        low: trade.price,
        close: trade.price,
        volume: trade.quantity,
      };
      pairCandles.push(newCandle);
    } else {
      // Update existing candle
      lastCandle.high = Math.max(lastCandle.high, trade.price);
      lastCandle.low = Math.min(lastCandle.low, trade.price);
      lastCandle.close = trade.price;
      lastCandle.volume += trade.quantity;
    }

    this.candles[trade.pairId] = pairCandles;
  }

  getCandles(pairId: string, limit = 100): Candle[] {
    const all = this.candles[pairId] || [];
    return all.slice(-limit);
  }
}
