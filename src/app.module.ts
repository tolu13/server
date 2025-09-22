import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderBookGateway } from './orders/orderbook.gateway';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import OrderBook from './orders/OrderBook';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import { TradesModule } from './trades/trades.module';
import { AssetsModule } from './assets/assets.module';
import { TradingpairModule } from './tradingpair/tradingpair.module';
import { WalletModule } from './wallet/wallet.module';
import { CandlesModule } from './candles/candles.module';
import { CandlesService } from './candles/candles.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere
    }),
    UserModule,
    AuthModule,
    OrdersModule,
    TradesModule,
    AssetsModule,
    TradingpairModule,
    WalletModule,
    CandlesModule,
  ],
  controllers: [AppController],
  providers: [AppService, OrderBookGateway, OrderBook, CandlesService],
})
export class AppModule {}
