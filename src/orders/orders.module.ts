import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import OrderBook from './OrderBook';
import { OrderBookGateway } from './orderbook.gateway';
import { CandlesModule } from 'src/candles/candles.module';

@Module({
  imports: [CandlesModule], // Import CandlesModule to use its services
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrderBook, OrderBookGateway],
})
export class OrdersModule {}
